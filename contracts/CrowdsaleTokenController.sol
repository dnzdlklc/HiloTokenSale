pragma solidity ^0.4.18;

import 'minimetoken/contracts/TokenController.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

import './AddressWhitelist.sol';
import './HiloToken.sol';

contract CrowdsaleTokenController is Ownable, AddressWhitelist, TokenController {
    bool public whitelistOff;
    HiloToken public token;

    function CrowdsaleTokenController(HiloToken _token) public {
        token = _token;
    }

    // set the whitelistOff variable
    function setWhitelistOff(bool _whitelistOff) public onlyOwner {
        whitelistOff = _whitelistOff;
    }

    // the owner of the controller can change the controller to a new contract
    function changeController(address newController) public onlyOwner {
        token.changeController(newController);
    }

    // change whether transfers are enabled
    function enableTransfers(bool _transfersEnabled) public onlyOwner {
        token.enableTransfers(_transfersEnabled);
    }

    /// @notice Called when `_owner` sends ether to the MiniMe Token contract
    /// @param _owner The address that sent the ether to create tokens
    /// @return True if the ether is accepted, false if it throws
    function proxyPayment(address _owner) public payable returns (bool) {
        return false;
    }

    /// @notice Notifies the controller about a token transfer allowing the
    ///  controller to react if desired
    /// @param _from The origin of the transfer
    /// @param _to The destination of the transfer
    /// @param _amount The amount of the transfer
    /// @return False if the controller does not authorize the transfer
    function onTransfer(address _from, address _to, uint _amount) public returns (bool) {
        return whitelistOff || isWhitelisted(_from);
    }

    /// @notice Notifies the controller about an approval allowing the
    ///  controller to react if desired
    /// @param _owner The address that calls `approve()`
    /// @param _spender The spender in the `approve()` call
    /// @param _amount The amount in the `approve()` call
    /// @return False if the controller does not authorize the approval
    function onApprove(address _owner, address _spender, uint _amount) public returns (bool) {
        return whitelistOff || isWhitelisted(_owner);
    }
}
