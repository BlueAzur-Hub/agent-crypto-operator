/* ERITH.IA · pure reusable spot case-study arithmetic. DOCUMENTARY PAPER ONLY.
 * No fetch, balance, pair permissions, filled orders, executable signals, or
 * persistence. The tax column is an illustrative deduction, NOT French tax law.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.ErithSpotCaseScenarioModel=api;
})(typeof globalThis==="object"?globalThis:null,function(){
  "use strict";
  const finite=v=>typeof v==="number"&&Number.isFinite(v)?v:null;
  function spot({budgetUsdc,entryUsd,exitUsd,buyFeePct=0.1,sellFeePct=0.1,fiscalIllustrationPct=31.4}={}){
    for(const [name,v] of Object.entries({budgetUsdc,entryUsd,exitUsd,buyFeePct,sellFeePct,fiscalIllustrationPct})){
      if(finite(v)===null)throw Error(name+" numeric input required");
    }
    if(!(budgetUsdc>0&&entryUsd>0&&exitUsd>0&&
      buyFeePct>=0&&buyFeePct<100&&sellFeePct>=0&&sellFeePct<100&&
      fiscalIllustrationPct>=0&&fiscalIllustrationPct<=100))
      throw Error("PAPER scenario outside valid bounds");
    // Full arithmetic, no tickSize/lotSize/slippage proof. Hypothetical base-asset
    // acquisition fee and quote-currency liquidation fee.
    const grossTokens=budgetUsdc/entryUsd;
    const tokensAfterBuyFee=grossTokens*(1-buyFeePct/100);
    const exitGrossUsd=tokensAfterBuyFee*exitUsd;
    const exitNetUsd=exitGrossUsd*(1-sellFeePct/100);
    const profitBeforeTaxUsd=exitNetUsd-budgetUsdc;
    const fiscalIllustrationDeductionUsd=Math.max(0,profitBeforeTaxUsd)*fiscalIllustrationPct/100;
    return Object.freeze({
      schema:"erith.case.spot.paper.v1",mode:"PURE_HYPOTHETICAL",
      budgetUsdc,entryUsd,exitUsd,buyFeePct,sellFeePct,
      tokensAfterBuyFee,exitNetUsd,profitBeforeTaxUsd,
      profitableBeforeTax:profitBeforeTaxUsd>0,
      fiscalIllustrationPct,
      fiscalIllustrationDeductionUsd,
      profitAfterIllustrativeDeductionUsd:profitBeforeTaxUsd-fiscalIllustrationDeductionUsd,
      profitAfterActualFrenchTaxUsd:null,
      feesVerified:false,lotSizeVerified:false,
      spotPairVerified:false,bidAskVerified:false,
      accountVerified:false,realOrderAmountUsdc:0,
      ordersEnabled:false,tradeApproved:false,
      quoteConversionVerified:false,
      priceScenarioActuallyOccurred:false,
      realizedProfitUsd:null
    });
  }
  // Distinct historical PRE-SALE illustration, not a 100-USDC spot order.
  // 42.03% pro-rata and 5%+20%/(1+(commitment/2472)^2) bonus were published
  // by Axis after closing. They are not guaranteed for another sale/token.
  function presale({commitmentUsdc,proRata=0.4203,priceUsd=0.1}={}){
    if(finite(commitmentUsdc)===null||commitmentUsdc<=0||
       finite(proRata)===null||proRata<0||proRata>1||
       finite(priceUsd)===null||priceUsd<=0)throw Error("Invalid public sale input");
    const eligibleByMinimum=commitmentUsdc>=100;
    if(!eligibleByMinimum)return Object.freeze({
      schema:"erith.case.presale.paper.v1",commitmentUsdc,
      eligibleByMinimum:false,minUsdc:100,acceptedUsdc:0,refundUsdc:commitmentUsdc,
      baseAllocationAxis:0,bonusAxis:0,tgeTheoreticalUnlockedAxis:0,lockedBaseAxis:0,
      realOrderAmountUsdc:0,ordersEnabled:false,profitUsd:null,
      warning:"Below minimum; no participation could have occurred."
    });
    const acceptedUsdc=commitmentUsdc*proRata;
    const baseAllocationAxis=acceptedUsdc/priceUsd;
    const bonusRate=0.05+0.20/(1+Math.pow(commitmentUsdc/2472,2));
    const bonusAxis=baseAllocationAxis*bonusRate;
    return Object.freeze({
      schema:"erith.case.presale.paper.v1",commitmentUsdc,
      eligibleByMinimum:true,minUsdc:100,acceptedUsdc,
      refundUsdc:commitmentUsdc-acceptedUsdc,
      baseAllocationAxis,bonusRate,bonusAxis,
      tgeTheoreticalUnlockedAxis:baseAllocationAxis*0.25+bonusAxis,
      lockedBaseAxis:baseAllocationAxis*0.75,
      distributionConfirmed:false,actualAllocationVerified:false,
      tokenActuallySellableAtTge:false,
      realOrderAmountUsdc:0,ordersEnabled:false,profitUsd:null,
      warning:"Historical pro-rata approximation. TGE distribution, eligibility, slippage, tax and resale NOT verified."
    });
  }
  return Object.freeze({spot,presale,realOrders:false,storage:false,privateAccount:false});
});
