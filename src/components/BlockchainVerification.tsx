import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { GlassCard } from "@/components/sg/GlassCard";

interface BlockchainProof {
  contractAddress: string;
  txHash: string;
  blockNumber: number;
  network: "localhost" | "sepolia" | "mainnet";
  ipfsCID?: string;
}

interface BlockchainVerificationProps {
  proof: BlockchainProof;
  ipfsMetadata?: Record<string, any>;
}

export function BlockchainVerification({
  proof,
  ipfsMetadata,
}: BlockchainVerificationProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const etherscanUrl = {
    localhost: "",
    sepolia: `https://sepolia.etherscan.io/tx/${proof.txHash}`,
    mainnet: `https://etherscan.io/tx/${proof.txHash}`,
  };

  const ipfsGateway = proof.ipfsCID
    ? `https://gateway.pinata.cloud/ipfs/${proof.ipfsCID}`
    : null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <GlassCard className="p-6 border border-success/30 bg-success/5">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            Blockchain Verified
          </h3>
          <p className="text-sm text-muted-foreground">
            Immutable proof registered on-chain
          </p>
        </div>
      </div>

      {/* Network Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2/50 hover:bg-surface-2/70 transition-colors">
          <span className="text-sm text-muted-foreground">Network:</span>
          <span className="font-semibold text-foreground capitalize">
            {proof.network}
          </span>
        </div>

        {/* Block Number */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2/50 hover:bg-surface-2/70 transition-colors">
          <span className="text-sm text-muted-foreground">Block:</span>
          <span className="font-mono text-sm font-semibold text-primary">
            {proof.blockNumber.toLocaleString()}
          </span>
        </div>

        {/* Contract Address */}
        <div className="p-3 rounded-lg bg-surface-2/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Contract:</span>
            <button
              onClick={() => handleCopy(proof.contractAddress, "contract")}
              className="p-1 hover:bg-surface-2 rounded transition-colors"
              title="Copy contract address"
            >
              {copied === "contract" ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
          <code className="text-xs font-mono break-all text-foreground/80">
            {proof.contractAddress}
          </code>
        </div>

        {/* TX Hash */}
        <div className="p-3 rounded-lg bg-surface-2/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">TX Hash:</span>
            <button
              onClick={() => handleCopy(proof.txHash, "tx")}
              className="p-1 hover:bg-surface-2 rounded transition-colors"
              title="Copy transaction hash"
            >
              {copied === "tx" ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
          <code className="text-xs font-mono break-all text-foreground/80">
            {proof.txHash}
          </code>
        </div>
      </div>

      {/* IPFS Metadata */}
      {ipfsMetadata && (
        <div className="mb-4 p-3 rounded-lg bg-info/5 border border-info/20">
          <h4 className="text-sm font-semibold text-info mb-2">IPFS Metadata</h4>
          <div className="text-xs space-y-1 text-foreground/70">
            {ipfsMetadata.title && (
              <div>
                <span className="font-semibold">Title:</span> {ipfsMetadata.title}
              </div>
            )}
            {ipfsMetadata.owner && (
              <div>
                <span className="font-semibold">Owner:</span> {ipfsMetadata.owner}
              </div>
            )}
            {ipfsMetadata.broadcast_timestamp && (
              <div>
                <span className="font-semibold">Broadcast:</span>{" "}
                {new Date(ipfsMetadata.broadcast_timestamp).toLocaleString()}
              </div>
            )}
            {ipfsMetadata.watermark_method && (
              <div>
                <span className="font-semibold">Watermark:</span>{" "}
                {ipfsMetadata.watermark_method}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {proof.network !== "localhost" && etherscanUrl[proof.network] && (
          <a
            href={etherscanUrl[proof.network]}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            View on Etherscan
            <ExternalLink className="h-3 w-3" />
          </a>
        )}

        {ipfsGateway && (
          <a
            href={ipfsGateway}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-info/40 bg-info/10 px-3 py-2 text-xs font-semibold text-info hover:bg-info/20 transition-colors"
          >
            View IPFS Data
            <ExternalLink className="h-3 w-3" />
          </a>
        )}

        {proof.ipfsCID && (
          <button
            onClick={() => handleCopy(proof.ipfsCID, "ipfs")}
            className="flex items-center gap-2 rounded-lg border border-muted-foreground/30 bg-surface-2/50 px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-surface-2 transition-colors"
            title="Copy IPFS CID"
          >
            {copied === "ipfs" ? (
              <>
                <Check className="h-3 w-3 text-success" />
                Copied CID
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy CID
              </>
            )}
          </button>
        )}
      </div>

      {/* Footer Info */}
      <p className="mt-4 text-xs text-muted-foreground/70">
        This proof is immutable and permanently recorded on the blockchain. It
        can be verified at any time using the transaction hash and contract
        address.
      </p>
    </GlassCard>
  );
}
