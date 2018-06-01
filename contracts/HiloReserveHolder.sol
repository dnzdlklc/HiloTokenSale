pragma solidity ^0.4.18;

import './KnowsConstants.sol';
import './HiloToken.sol';
import './KnowsTime.sol';

/**
 * @title HiloReserveHolder
 * @dev HiloReserveHolder is a token holder contract that will allow a
 * beneficiary to extract the tokens after a given release time
 */
contract HiloReserveHolder is KnowsConstants, KnowsTime {
    // HiloToken address
    HiloToken public token;

    // beneficiary of tokens after they are released
    address public beneficiary;

    function HiloReserveHolder(HiloToken _token, address _beneficiary) public {
        require(_token != address(0));
        require(_beneficiary != address(0));

        token = _token;
        beneficiary = _beneficiary;
    }

    /**
     * @notice Transfers tokens held by timelock to beneficiary.
     */
    function release() public {
        require(currentTime() >= UNFREEZE_DATE);

        uint amount = token.balanceOf(this);
        require(amount > 0);

        require(token.transfer(beneficiary, amount));
    }
}
