pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './KnowsTime.sol';


// This contract does the math to figure out the HILO paid per WEI, based on the USD ether price
contract HiloExchangeRateCalculator is KnowsTime, Ownable {
    using SafeMath for uint;

    uint public constant WEI_PER_ETH = 10 ** 18;

    uint public constant MICRODOLLARS_PER_DOLLAR = 10 ** 6;

    uint public hiloMicrodollarPrice;

    uint public USDEtherPrice;

    uint public fixUSDPriceTime;

    // a microdollar is one millionth of a dollar, or one ten-thousandth of a cent
    function HiloExchangeRateCalculator(uint _hiloMicrodollarPrice, uint _USDEtherPrice, uint _fixUSDPriceTime)
        public
    {
        require(_hiloMicrodollarPrice > 0);
        require(_USDEtherPrice > 0);

        hiloMicrodollarPrice = _hiloMicrodollarPrice;
        fixUSDPriceTime = _fixUSDPriceTime;
        USDEtherPrice = _USDEtherPrice;
    }

    // the owner can change the usd ether price
    function setUSDEtherPrice(uint _USDEtherPrice) onlyOwner public {
        require(currentTime() < fixUSDPriceTime);
        require(_USDEtherPrice > 0);

        USDEtherPrice = _USDEtherPrice;
    }

    // returns the number of wei some amount of usd
    function usdToWei(uint usd) view public returns (uint) {
        return WEI_PER_ETH.mul(usd).div(USDEtherPrice);
    }

    // returns the number of hilo per some amount in wei
    function weiToHilo(uint amtWei) view public returns (uint) {
        return USDEtherPrice.mul(MICRODOLLARS_PER_DOLLAR).mul(amtWei).div(hiloMicrodollarPrice);
    }
}
