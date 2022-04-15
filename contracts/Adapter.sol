// SPDX-License-Identifier: MIT

pragma solidity >= 0.8.12 <0.9.0;

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Adapter is Ownable {
    address public immutable ROUTER;
    address public immutable FACTORY;
    mapping(address => mapping(address => address)) public pairs;
    mapping(address => mapping(address => uint256)) public prices;

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
        } else {
            revert("Adapter: Failed to create pair");
        }
    }

    /// @notice adds liquidity by calling Uniswap contract https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02#addliquidity
    /// @dev contract always sends to msg.sender with hardcoded deadline
    /// @param token0 - a pool token
    /// @param token1 - a pool token
    /// @param amount0D amount of tokenA to add as liquidity if the B/A price is <= amountBDesired/amountADesired (A depreciates)
    /// @param amount1D amount of tokenB to add as liquidity if the A/B price is <= amountADesired/amountBDesired (B depreciates)
    /// @param amount0M bounds the extent to which the B/A price can go up before the transaction reverts. Must be <= amountADesired
    /// @param amount1M bounds the extent to which the A/B price can go up before the transaction reverts. Must be <= amountBDesired
    function addLiquidity(address token0, address token1, uint amount0D, uint amount1D, uint amount0M, uint amount1M) external {
        (bool success,) = ROUTER.delegatecall(abi.encodeWithSignature(
            "addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)", 
            token0, token1, amount0D, amount1D, amount0M, amount1M, msg.sender, block.timestamp + 60)
        );

        require(success, "Adapter: Failed to add liquidity");
    }

    /// @notice adds liquidity by calling Uniswap contract https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02#addliquidityeth
    /// @dev contract always sends to msg.sender with hardcoded deadline
    /// @param token - a pool token
    /// @param amountD amount of token to add as liquidity if the WETH/token price is <= msg.value/amountTokenDesired (token depreciates)
    /// @param amountM bounds the extent to which the WETH/token price can go up before the transaction reverts. Must be <= amountTokenDesired
    /// @param amountEM bounds the extent to which the token/WETH price can go up before the transaction reverts. Must be <= msg.value
    function addLiquidityETH(address token, uint amountD, uint amountM, uint amountEM) external payable {
        require(msg.value > 0, "Adapter: zero ETH value");
        
        (bool success,) = ROUTER.delegatecall(abi.encodeWithSignature(
            "addLiquidityETH(address,uint256,uint256,uint256,address,uint256)", 
            token, amountD, amountM, amountEM, msg.sender, block.timestamp + 60)
        );
        
        require(success, "Adapter: Failed to add liquidity eth");
    }


    /// @notice removes liquidity by calling Uniswap contract https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02#removeliquidity
    /// @dev contract always sends to msg.sender with hardcoded deadline
    /// @param token0 - a pool token
    /// @param token1 - a pool token
    /// @param liquidity amount of liquidity tokens to remove
    /// @param amount0M minimum amount of tokenA that must be received for the transaction not to revert
    /// @param amount1M minimum amount of tokenB that must be received for the transaction not to revert
    function removeLiquidity(address token0, address token1, uint liquidity, uint amount0M, uint amount1M) external {
        (bool success, bytes memory data) = ROUTER.delegatecall(abi.encodeWithSignature(
            "removeLiquidity(address,address,uint256,uint256,uint256,address,uint256)", 
            token0, token1, liquidity, amount0M, amount1M, msg.sender, block.timestamp + 60)
        );
        
        require(success, "Adapter: Failed to remove liquidity");
    }

    /// @notice removes liquidity by calling Uniswap contract https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02#removeliquidityeth
    /// @dev contract always sends to msg.sender with hardcoded deadline
    /// @param token - a pool token
    /// @param liquidity - amount of liquidity tokens to remove.
    /// @param amountM - minimum amount of token that must be received for the transaction not to revert
    /// @param amountEM - minimum amount of ETH that must be received for the transaction not to revert
    function removeLiquidityETH(address token, uint liquidity, uint amountM, uint amountEM) external {
        address weth = IUniswapV2Router02(ROUTER).WETH();
        address pair = pairs[token][weth];

        pair.call(abi.encodeWithSignature("transferFrom(address,address,uint256)", msg.sender, address(this), liquidity));
        pair.call(abi.encodeWithSignature("approve(address,uint256)", ROUTER, liquidity));

        (uint amountA, uint amountB) = IUniswapV2Router02(ROUTER).removeLiquidityETH(token, liquidity, amountM, amountEM, msg.sender, block.timestamp + 60);
    }

    /// @notice polls Uniswap for how much tokenB is one tokenA worth
    /// @dev only records current price, to get it use pairs mapping
    /// @param tokenA - first token
    /// @param tokenB - second token
    function updatePairPrice(address tokenA, address tokenB) external {
        require(tokenA != address(0) && tokenB != address(0), "Adapter: Incorrect address");

        address[] memory addresses = new address[](2);
        addresses[0] = tokenA;
        addresses[1] = tokenB;
        (uint256[] memory amounts) = IUniswapV2Router02(ROUTER).getAmountsOut(10**18, addresses);
        prices[tokenA][tokenB] = amounts[1];
    }

    /// @notice swaps one token for another by calling Uniswap contract https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02#swapexacttokensfortokens
    /// @dev contract always sends to msg.sender with hardcoded deadline
    /// @param token0 - a pool token
    /// @param token1 - a pool token
    /// @param amountIn - amount of input tokens to send
    /// @param amountOutMin - minimum amount of output tokens that must be received for the transaction not to revert
    function makeDirectSwap(address token0, address token1, uint amountIn, uint amountOutMin) external {
        address pair = pairs[token0][token1];
        require(pair != address(0), "Adapter: Unknown pair");

        token0.call(abi.encodeWithSignature("transferFrom(address,address,uint256)", msg.sender, address(this), amountIn));
        token0.call(abi.encodeWithSignature("approve(address,uint256)", ROUTER, amountIn));

        address[] memory addresses = new address[](2);
        addresses[0] = token0;
        addresses[1] = token1;

        IUniswapV2Router02(ROUTER).swapExactTokensForTokens(amountIn, amountOutMin, addresses, msg.sender, block.timestamp + 60);
    }

    /// @notice swaps one token for another by calling Uniswap contract https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02#swapexacttokensfortokens
    /// @dev contract always sends to msg.sender with hardcoded deadline
    /// @param tokens - multiple tokens that make up path
    /// @param amountIn - amount of input tokens to send
    /// @param amountOutMin - minimum amount of output tokens that must be received for the transaction not to revert
    function makePathSwap(address[] memory tokens, uint amountIn, uint amountOutMin) external {
        tokens[0].call(abi.encodeWithSignature("transferFrom(address,address,uint256)", msg.sender, address(this), amountIn));
        tokens[0].call(abi.encodeWithSignature("approve(address,uint256)", ROUTER, amountIn));

        address[] memory addresses = new address[](tokens.length);

        for (uint256 i = 0; i < tokens.length; i++) {
            addresses[i] = tokens[i];
        }

        IUniswapV2Router02(ROUTER).swapExactTokensForTokens(amountIn, amountOutMin, addresses, msg.sender, block.timestamp + 60);
    }
}
