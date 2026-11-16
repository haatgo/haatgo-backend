import {entity,requireThat,type Ledger,type State} from './domain.js';
export function settlementStates(entry:Ledger):Record<string,readonly string[]>{
  if(entry.purpose==='COD_COLLECTION')return {collected:['remitted','disputed'],disputed:['remitted']};
  if(entry.purpose==='PARTNER_EARNING')return {earned:['approved','disputed'],approved:['paid','disputed'],disputed:['approved']};
  if(entry.purpose==='PURCHASE_REIMBURSEMENT')return {pending:['approved','disputed'],approved:['paid','disputed'],disputed:['approved']};
  if(entry.purpose.includes('REFUND'))return {pending:['refunded','disputed'],disputed:['refunded']};
  return {};
}
export function recordSettlement(state:State,entry:Ledger,status:string){
  requireThat(settlementStates(entry)[entry.status]?.includes(status),'ILLEGAL_TRANSITION','Invalid settlement transition',409);
  if(!['paid','remitted','refunded'].includes(status))return;
  const id=`settlement:${entry.id}:${status}`;if(state.ledger.some(e=>e.groupId===id))return;
  const debit=status==='remitted'?'BANK_CASH':status==='refunded'?'CUSTOMER_REFUND_PAYABLE':entry.purpose==='PARTNER_EARNING'?'PARTNER_PAYABLE':'PARTNER_REIMBURSEMENT_PAYABLE';
  const credit=status==='remitted'?'PARTNER_CASH_IN_HAND':'BANK_CASH';
  for(const counterpart of [false,true])state.ledger.push({...entity('settlement'),orderId:entry.orderId,partnerId:entry.partnerId,account:counterpart?credit:debit,purpose:counterpart?'CASH_SETTLEMENT_COUNTERPART':'CASH_SETTLEMENT',amountPaise:entry.amountPaise,debitPaise:counterpart?0:entry.amountPaise,creditPaise:counterpart?entry.amountPaise:0,status:'posted',groupId:id});
}
