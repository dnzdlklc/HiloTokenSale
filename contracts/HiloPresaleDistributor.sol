pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/Math.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './HiloToken.sol';
import './interfaces/HiloPresaleI.sol';
import './HiloExchangeRateCalculator.sol';
import './KnowsConstants.sol';

/*
This contract manages compensation of the presale investors, based on the contribution balances recorded in the presale
contract.
*/
contract HiloPresaleDistributor is KnowsConstants, HiloExchangeRateCalculator {
    using SafeMath for uint;

    HiloPresaleI public deployedPresaleContract;
    HiloToken public hiloToken;

    mapping(address => uint) public tokensPaid;

    function HiloPresaleDistributor(HiloToken _hiloToken, HiloPresaleI _deployedPresaleContract)
        HiloExchangeRateCalculator(MICRO_DOLLARS_PER_HILO_PRESALE, FIXED_PRESALE_USD_ETHER_PRICE, 0)
        public
    {
        hiloToken = _hiloToken;
        deployedPresaleContract = _deployedPresaleContract;
    }

    event OnPreSaleBuyerCompensated(address indexed contributor, uint numTokens);

    /**
     * Compensate the presale investors at the addresses provider based on their contributions during the presale
     */
    function compensatePreSaleInvestors(address[] preSaleInvestors) public {
        // iterate through each investor
        for (uint i = 0; i < preSaleInvestors.length; i++) {
            address investorAddress = preSaleInvestors[i];

            // the deployed presale contract tracked the balance of each contributor
            uint weiContributed = deployedPresaleContract.balanceOf(investorAddress);

            // they contributed and haven't been paid
            if (weiContributed > 0 && tokensPaid[investorAddress] == 0) {
                // convert the amount of wei they contributed to the Hilo
                uint hiloCompensation = Math.min256(weiToHilo(weiContributed), hiloToken.balanceOf(this));

                // mark them paid first
                tokensPaid[investorAddress] = hiloCompensation;

                // transfer tokens to presale contributor address
                require(hiloToken.transfer(investorAddress, hiloCompensation));

                // log the event
                OnPreSaleBuyerCompensated(investorAddress, hiloCompensation);
            }
        }
    }
}
