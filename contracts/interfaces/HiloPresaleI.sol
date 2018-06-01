pragma solidity ^0.4.18;

/**
 * This interface describes the only function we will be calling from the HiloPresaleI contract
 */
interface HiloPresaleI {
    function balanceOf(address addr) public returns (uint balance);
}
