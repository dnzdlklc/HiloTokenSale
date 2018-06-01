pragma solidity ^0.4.18;

import '../interfaces/HiloPresaleI.sol';

// Mock presale contract used for testing the presale distributor
contract MockHiloPresale is HiloPresaleI {

    mapping (address => uint) public contributions;

    function MockHiloPresale(address[] contributors, uint[] amounts) public {
        for (uint i = 0; i < contributors.length; i++) {
            contributions[contributors[i]] = amounts[i];
        }
    }

    function balanceOf(address addr) public returns (uint balance) {
        return contributions[addr];
    }

}
