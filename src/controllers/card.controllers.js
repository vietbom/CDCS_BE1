import Student from "../models/User/Student.js"
import Card from "../models/Card.js"

//Khi tạo sinh viên THẺ THƯ VIỆN được kích hoạt tự động với thời gian 6 tháng  
export const getCard = async (req, res) => {
    try {
        const card = await Card.find()
            .populate('MaSV', 'MaSV userName')
        if(!card){
            return res.status(404).json({message: 'Không tìm thấy thẻ'})
        }
        res.json({data: card})
    } catch (error) {
        console.error("Lỗi trong getCard:", error)
        res.status(500).json({message: 'Lỗi máy chủ'})
    }
}

export const findCard = async(req, res)=>{
    try {
        const {MaThe} = req.body
        if(!MaThe){
            return res.status(400).json({message: "MaSV là thông tin bắt buộc "})
        }
        const filteredCard = await Card.find({MaThe}).populate('MaSV')
        res.status(200).json({ data: filteredCard })
    } catch (error) {
        console.error("Lỗi trong findCard controller:", error.message)
        res.status(500).json({ message: "Lỗi Máy Chủ Nội Bộ" })
    }
}

export const updateCardStatus = async (req, res) => {
    try {
        const today = new Date()
        const overdueCards = await Card.find({
            status: 'Active',
            ngayHetHan: {$lt: today}
        }).populate('MaSV', 'MaSV userName')

        if (overdueCards.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'Không có thẻ nào cần cập nhật trạng thái',
                data: []
            })
        }

        const updatedCards = []
        for (const card of overdueCards) {
            card.status = 'Overdue'
            await card.save()
            updatedCards.push({
                MaThe: card.MaThe,
                MaSV: card.MaSV.MaSV,
                userName: card.MaSV.userName,
                ngayCap: card.ngayCap,
                ngayHetHan: card.ngayHetHan,
                status: card.status
            })
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái thẻ thành công',
            data: updatedCards
        })

    } catch (error) {
        console.error("Lỗi trong updateCardStatus:", error)
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ'
        })
    }
}

export const reactivateCard = async (req, res) => {
  try {
  const { id } = req.params;    
  const { ngayHetHan } = req.body;

    if (!ngayHetHan) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu ngày hết hạn mới',
      });
    }

    const hetHanDate = new Date(ngayHetHan);
    if (isNaN(hetHanDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Ngày hết hạn không hợp lệ',
      });
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    hetHanDate.setHours(0, 0, 0, 0);

    if (hetHanDate < now) {
      return res.status(400).json({
        success: false,
        message: 'Ngày hết hạn mới không được nhỏ hơn ngày hiện tại',
      });
    }

    const card = await Card.findById(id).populate('MaSV', 'MaSV userName');
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thẻ',
      });
    }

    card.ngayHetHan = hetHanDate;
    card.status = 'Active';

    await card.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật thẻ thành công',
      data: {
        _id: card._id,
        MaThe: card.MaThe,
        MaSV: card.MaSV.MaSV,
        userName: card.MaSV.userName,
        ngayCap: card.ngayCap,
        ngayHetHan: card.ngayHetHan,
        status: card.status,
      },
    });
  } catch (error) {
    console.error('Lỗi trong reactivateCard:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ',
    });
  }
};


