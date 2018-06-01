pragma solidity ^0.4.18;

contract KnowsTime {
    function KnowsTime() public {
    }

    function currentTime() public view returns (uint) {
        return now;
    }
}
