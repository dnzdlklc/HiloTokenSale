pragma solidity ^0.4.18;


import '../HiloExchangeRateCalculator.sol';
import './MockKnowsTime.sol';


// Just overwrites the currentTime() method so we can change the time for mocks
contract MockHiloExchangeRateCalculator is HiloExchangeRateCalculator, MockKnowsTime {
    function MockHiloExchangeRateCalculator(uint _hiloMicrodollarPrice, uint _USDEtherPrice, uint _fixUSDPriceTime)
    HiloExchangeRateCalculator(_hiloMicrodollarPrice, _USDEtherPrice, _fixUSDPriceTime)
    public
    {}
}
