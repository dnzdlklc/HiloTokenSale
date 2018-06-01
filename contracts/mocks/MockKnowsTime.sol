pragma solidity ^0.4.18;

import '../KnowsTime.sol';

// This mock contract is used to test contracts that rely on the current time
contract MockKnowsTime is KnowsTime {
    uint time;

    function MockKnowsTime() public {
        time = now;
    }

    function setTime(uint _time) public {
        time = _time;
    }

    function currentTime() public view returns (uint) {
        return time;
    }
}
