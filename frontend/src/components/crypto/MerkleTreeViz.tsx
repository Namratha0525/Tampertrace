import React from 'react';
import { MerkleNode } from '../../types';

interface MerkleTreeVizProps {
  tree: MerkleNode;
  tamperedLeaves?: number[];
}

export const MerkleTreeViz: React.FC<MerkleTreeVizProps> = ({ tree, tamperedLeaves = [] }) => {
  // SVG based implementation of Merkle tree
  // This is a simplified recursive renderer for demo purposes.
  // In a full app, a layout algorithm like Reingold-Tilford would be used.
  
  const NODE_RADIUS = 25;
  const LEVEL_HEIGHT = 80;
  const SIBLING_SPREAD = 60;
  
  const getTreeDepth = (node: MerkleNode): number => {
    if (!node.left && !node.right) return 1;
    return 1 + Math.max(
      node.left ? getTreeDepth(node.left) : 0,
      node.right ? getTreeDepth(node.right) : 0
    );
  };

  const depth = getTreeDepth(tree);
  const width = Math.pow(2, depth - 1) * SIBLING_SPREAD;
  const height = depth * LEVEL_HEIGHT + 40;

  const renderNode = (node: MerkleNode, x: number, y: number, level: number, offset: number) => {
    const isLeaf = node.is_leaf;
    const isTampered = node.status === 'tampered' || (isLeaf && node.leaf_index !== undefined && tamperedLeaves.includes(node.leaf_index));
    const isVerified = node.status === 'verified';
    
    let strokeColor = '#334155'; // neutral
    let fillColor = '#111827';
    let textColor = '#e2e8f0';

    if (isTampered) {
      strokeColor = '#ff3366';
      textColor = '#ff3366';
      if (isLeaf) fillColor = '#ff336620';
    } else if (isVerified) {
      strokeColor = '#00ff88';
      textColor = '#00ff88';
      if (isLeaf) fillColor = '#00ff8820';
    }

    const elements: JSX.Element[] = [];

    // Render children and lines first so they are behind nodes
    if (node.left) {
      const leftX = x - offset;
      const leftY = y + LEVEL_HEIGHT;
      elements.push(
        <line key={`line-l-${node.hash}`} x1={x} y1={y} x2={leftX} y2={leftY} stroke={strokeColor} strokeWidth="2" opacity="0.5" />
      );
      elements.push(...renderNode(node.left, leftX, leftY, level + 1, offset / 2));
    }

    if (node.right) {
      const rightX = x + offset;
      const rightY = y + LEVEL_HEIGHT;
      elements.push(
        <line key={`line-r-${node.hash}`} x1={x} y1={y} x2={rightX} y2={rightY} stroke={strokeColor} strokeWidth="2" opacity="0.5" />
      );
      elements.push(...renderNode(node.right, rightX, rightY, level + 1, offset / 2));
    }

    // Render current node
    elements.push(
      <g key={`node-${node.hash}`} className="transition-all duration-500">
        <circle 
          cx={x} cy={y} r={NODE_RADIUS} 
          fill={fillColor} 
          stroke={strokeColor} 
          strokeWidth={level === 0 ? "4" : "2"}
          className={isTampered ? 'animate-pulse' : ''}
          style={{ filter: isTampered ? 'drop-shadow(0 0 8px rgba(255,51,102,0.6))' : isVerified && level === 0 ? 'drop-shadow(0 0 8px rgba(0,255,136,0.6))' : 'none' }}
        />
        <title>Hash: {node.hash}</title>
        <text 
          x={x} y={y} 
          textAnchor="middle" 
          dominantBaseline="middle" 
          fill={textColor} 
          fontSize="10px" 
          fontFamily="monospace"
          fontWeight="bold"
        >
          {node.hash.substring(0, 8)}
        </text>
      </g>
    );

    return elements;
  };

  return (
    <div className="w-full overflow-x-auto bg-[#0a0e1a] rounded-xl border border-[#334155] p-6 flex justify-center custom-scrollbar">
      <svg width={Math.max(width, 600)} height={height} className="animate-in fade-in duration-1000">
        {renderNode(tree, Math.max(width, 600) / 2, 40, 0, width / 4)}
      </svg>
    </div>
  );
};
