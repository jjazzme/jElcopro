import TransferOut from "../db/TransferOutModel";

export default class ProcedureController{
  constructor(db) {
    this.db = db;
  }
  async modify(req){
    const method = req.params.id;
    const params = req.body;

    return this[method](params)
  }

  async Transition(params){
    const Model = this.db.models[params.Model];
    const model = await Model.findByPk(parseInt(params.id, 0));
    await model.services.transition.execute(params.transition, model);
    return { [Model.name]: [model.id] };
  }

  async makeChildren(params){
    if(params.for === 'Invoice') {
      const ans = await TransferOut.createFromOptics({ parent_id: params.id })
      return {
        _ans: ans,
        Invoice: [params.id]
      }
    }
    //return { _val: params }
  }
}