pragma solidity ^0.4.18;


import '../HiloCrowdsale.sol';
import './MockKnowsTime.sol';


// Mock presale contract used for testing the presale distributor
contract MockHiloCrowdsale is HiloCrowdsale, MockKnowsTime {
    function MockHiloCrowdsale(HiloToken _hiloToken, uint _USDEtherPrice)
        HiloCrowdsale(_hiloToken, _USDEtherPrice)
        public
    {
    }
}
