pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/math/Math.sol';

import './HiloToken.sol';
import './HiloExchangeRateCalculator.sol';
import './KnowsConstants.sol';
import './KnowsTime.sol';
import './AddressWhitelist.sol';
import './HiloPresaleDistributor.sol';
import './HiloReserveHolder.sol';

contract HiloCrowdsale is KnowsTime, KnowsConstants, Ownable, HiloExchangeRateCalculator, AddressWhitelist, Pausable {
    using SafeMath for uint;

    // Crowdsale contracts
    HiloToken public HiloToken;                                 // Reward tokens to compensate in

    // Contribution amounts
    mapping (address => uint) public contributionAmounts;            // The amount that each address has contributed
    uint public totalContributions;                                  // Total contributions given

    // Events
    event OnContribution(address indexed contributor, bool indexed duringWhitelistPeriod, uint indexed contributedWei, uint hiloAwarded, uint refundedWei);
    event OnWithdraw(address to, uint amount);

    function HiloCrowdsale(HiloToken _hiloToken, uint _USDEtherPrice)
        HiloExchangeRateCalculator(MICRO_DOLLARS_PER_HILO_MAINSALE, _USDEtherPrice, SALE_START_DATE)
        public
    {
        hiloToken = _hiloToken;
    }

    // the crowdsale owner may withdraw any amount of ether from this contract at any time
    function withdraw(uint amount) public onlyOwner {
        msg.sender.transfer(amount);
        OnWithdraw(msg.sender, amount);
    }

    // All contributions come through the fallback function
    function () payable public whenNotPaused {
        uint time = currentTime();

        // require the sale has started
        require(time >= SALE_START_DATE);

        // require that the sale has not ended
        require(time < SALE_END_DATE);

        // maximum contribution from this transaction is tracked in this variable
        uint maximumContribution = usdToWei(HARD_CAP_USD).sub(totalContributions);

        // store whether the contribution is made during the whitelist period
        bool isDuringWhitelistPeriod = time < WHITELIST_END_DATE;

        // these limits are only checked during the limited period
        if (time < LIMITS_END_DATE) {
            // require that they have not overpaid their gas price
            require(tx.gasprice <= MAX_GAS_PRICE);

            // require that they haven't sent too much gas
            require(msg.gas <= MAX_GAS);

            // if we are in the WHITELIST period, we need to make sure the sender contributed to the presale
            if (isDuringWhitelistPeriod) {
                require(isWhitelisted(msg.sender));

                // the maximum contribution is set for the whitelist period
                maximumContribution = Math.min256(
                    maximumContribution,
                    usdToWei(MAXIMUM_CONTRIBUTION_WHITELIST_PERIOD_USD).sub(contributionAmounts[msg.sender])
                );
            } else {
                // the maximum contribution is set for the limited period
                maximumContribution = Math.min256(
                    maximumContribution,
                    usdToWei(MAXIMUM_CONTRIBUTION_LIMITED_PERIOD_USD).sub(contributionAmounts[msg.sender])
                );
            }
        }

        // calculate how much contribution is accepted and how much is refunded
        uint contribution = Math.min256(msg.value, maximumContribution);
        uint refundWei = msg.value.sub(contribution);

        // require that they are allowed to contribute more
        require(contribution > 0);

        // account contribution towards total
        totalContributions = totalContributions.add(contribution);

        // account contribution towards address total
        contributionAmounts[msg.sender] = contributionAmounts[msg.sender].add(contribution);

        // and send them some hilo
        uint amountHiloRewarded = Math.min256(weiToHilo(contribution), hiloToken.balanceOf(this));
        require(hiloToken.transfer(msg.sender, amountHiloRewarded));

        if (refundWei > 0) {
            msg.sender.transfer(refundWei);
        }

        // log the contribution
        OnContribution(msg.sender, isDuringWhitelistPeriod, contribution, amountHiloRewarded, refundWei);
    }
}