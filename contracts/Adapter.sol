//SPDX-License-Identifier: MIT

pragma solidity >= 0.8.12 <0.9.0;

import "hardhat/console.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2ERC20.sol";

contract Adapter {
    address public immutable ROUTER;
    address public immutable FACTORY;
    mapping(address => mapping(address => address)) public pairs;

    constructor(address _router, address _factory) {
        ROUTER = _router;
        FACTORY = _factory;
    }

    /// @notice creates pair by calling Uniswap contract
    /// @dev adds two entries to mapping
    /// @param addr0 - token one
    /// @param addr1 - token two
    function createPair(address addr0, address addr1) external {
        address pairAddress = IUniswapV2Factory(FACTORY).createPair(addr0, addr1);

        if(pairAddress != address(0)) {
            pairs[addr0][addr1] = pairAddress;
            pairs[addr1][addr0] = pairAddress;
        }
    }

    /// @notice adds liquidiy by calling Uniswap contract https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02#addliquidity
    /// @dev router contract always sends to msg.sender with hardcoded deadline
    /// @param token0 - a pool token
    /// @param token1 - a pool token
    /// @param amount0D amount of tokenA to add as liquidity if the B/A price is <= amountBDesired/amountADesired (A depreciates)
    /// @param amount1D amount of tokenB to add as liquidity if the A/B price is <= amountADesired/amountBDesired (B depreciates)
    /// @param amount0M bounds the extent to which the B/A price can go up before the transaction reverts. Must be <= amountADesired
    /// @param amount1M bounds the extent to which the A/B price can go up before the transaction reverts. Must be <= amountBDesired
    function addLiquidity(address token0, address token1, uint amount0D, uint amount1D, uint amount0M, uint amount1M) external returns(uint) {
        // (bool success0,) = token0.call(abi.encodeWithSignature("transferFrom(address,address,uint256)", msg.sender, address(this), amount0D));
        // (bool success1,) = token1.call(abi.encodeWithSignature("transferFrom(address,address,uint256)", msg.sender, address(this), amount1D));
        // token0.call(abi.encodeWithSignature("approve(address,uint256)", ROUTER, amount0D));
        // token1.call(abi.encodeWithSignature("approve(address,uint256)", ROUTER, amount1D));
        // (uint amountA, uint amountB, uint liquidity) = IUniswapV2Router02(ROUTER).addLiquidity(token0, token1, amount0D, amount1D, amount0M, amount1M, msg.sender, block.timestamp + 60);

        (bool success,) = ROUTER.delegatecall(abi.encodeWithSignature(
            "addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)", 
            token0, token1, amount0D, amount1D, amount0M, amount1M, msg.sender, block.timestamp + 60)
        );

        require(success, "Adapter: Failed to add liquidity");
    }
/*
    /// @notice adds liquidiy by calling Uniswap contract https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02#addliquidityeth
    /// @dev 
    /// @param
    /// @return
    function addLiquidityETH() external payable {
        //IUniswapV2Router02(ROUTER).addLiquidityETH();
    }

    /// @notice
    /// @dev
    /// @param
    /// @return
    function removeLiquidiy() external {

    }

    /// @notice
    /// @dev
    /// @param
    /// @return
    function getPairPrice() external {

    }
    
    /// @notice
    /// @dev
    /// @param
    /// @return
    function makeDirectSwap() external {

    }

    /// @notice
    /// @dev
    /// @param
    /// @return
    function makePathSwap() external {

    }*/
}
