'use strict'

import ModelService from "../services/ModelService";
import InvoiceService from "../services/InvoiceService";
import OrderService from "../services/OrderService";
import TransferOutService from "../services/TransferOutService";
import TransferInService from "../services/TransferInService";

const models = require('../models');

class Document{
  constructor() {
  }

  doTransition(req, res){
    const type = req.params.type;
    const id = parseInt(req.params.id);
    const transition = req.params.transition;
    const own = req.params.own === 'true';

    const service = type === 'Invoice'
      ? new InvoiceService()
      : new OrderService();

    service.getModel(id)
      .then(inst=>{
        service.setInstance(inst)
          .then(()=>{
            service.transition(transition, { own: own })
              .then(ans=>res.status(200).send(ans))
              .catch(err=>res.status(406).send({ msg: err }))

          })
          .catch(err=>res.status(500).send({ msg: err }))

      })
      .catch(err=>res.status(500).send({ msg: err }))
  }

  createTransfer(req, res){

    const optics = req.body.optics;
    optics.user_id = 1;
    optics.number_prefix = 'УПД';
    const type = optics.type;

    const service = type === 'out'
      ? new TransferOutService()
      : new TransferInService();

    const model = type === 'out'
      ? models['TransferOut'] //TransferOut
      : models['TransferIn'];

    model.max('number')
      .then(ans=>{
        optics.number = !ans ? 1 : ans + 1;

        const  method = type === 'out'
          ? service.createTransferOut(optics)
          : service.createTransferIn(optics);

        method
          .then(ins=>res.status(200).send(ins))
          .catch(err=>res.status(500).send({message: err.message}))
      })



  }
}

export default Document;