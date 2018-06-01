pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/TokenVesting.sol';
import './KnowsConstants.sol';

contract HiloTokenVesting is KnowsConstants, TokenVesting {
    function HiloTokenVesting(address _beneficiary, uint durationWeeks)
        TokenVesting(_beneficiary, WHITELIST_END_DATE, 0, durationWeeks * 1 weeks, false)
        public
    {
    }
}
