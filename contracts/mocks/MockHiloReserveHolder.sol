pragma solidity ^0.4.18;

import '../HiloReserveHolder.sol';
import './MockKnowsTime.sol';

// Just overwrites the currentTime() method so we can change the time for mocks
contract MockHiloReserveHolder is HiloReserveHolder, MockKnowsTime {
    function MockHiloReserveHolder(HiloToken _token, address _beneficiary)
        MockHiloReserveHolder(_token, _beneficiary)
        public
    {}
}
