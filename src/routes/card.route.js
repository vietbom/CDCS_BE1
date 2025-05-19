import express from "express";
import {findCard, getCard, reactivateCard, updateCardStatus } from "../controllers/card.controllers.js";

const cardRouter = express.Router()

cardRouter.get('/getCard', getCard)
cardRouter.post('/findCard', findCard)
cardRouter.post('/updateCard', updateCardStatus)
cardRouter.post('/reactiveCard/:id', reactivateCard);

export default cardRouter