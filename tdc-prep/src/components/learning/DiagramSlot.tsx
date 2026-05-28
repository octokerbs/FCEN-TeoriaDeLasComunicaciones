"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const DIAGRAMS: Record<string, React.ComponentType<{ className?: string }>> = {
  OSIModel: dynamic(() => import("@/components/diagrams/OSIModel"), { ssr: false }),
  TCPHandshake: dynamic(() => import("@/components/diagrams/TCPHandshake"), { ssr: false }),
  TCPStateMachine: dynamic(() => import("@/components/diagrams/TCPStateMachine"), { ssr: false }),
  DNSResolution: dynamic(() => import("@/components/diagrams/DNSResolution"), { ssr: false }),
  RSAFlow: dynamic(() => import("@/components/diagrams/RSAFlow"), { ssr: false }),
  DigitalSignature: dynamic(() => import("@/components/diagrams/DigitalSignature"), { ssr: false }),
  ShannonChannel: dynamic(() => import("@/components/diagrams/ShannonChannel"), { ssr: false }),
  ShannonEntropy: dynamic(() => import("@/components/diagrams/ShannonEntropy"), { ssr: false }),
  SlidingWindow: dynamic(() => import("@/components/diagrams/SlidingWindow"), { ssr: false }),
  CSMACD: dynamic(() => import("@/components/diagrams/CSMACD"), { ssr: false }),
  IPHeader: dynamic(() => import("@/components/diagrams/IPHeader"), { ssr: false }),
  TCPSegment: dynamic(() => import("@/components/diagrams/TCPSegment"), { ssr: false }),
  CongestionControl: dynamic(() => import("@/components/diagrams/CongestionControl"), { ssr: false }),
  SubnetMask: dynamic(() => import("@/components/diagrams/SubnetMask"), { ssr: false }),
  SymmetricVsAsymmetric: dynamic(() => import("@/components/diagrams/SymmetricVsAsymmetric"), { ssr: false }),
  AccessPointWifi: dynamic(() => import("@/components/diagrams/AccessPointWifi"), { ssr: false }),
};

export function DiagramSlot({ name }: { name: string }) {
  const Component = useMemo(() => DIAGRAMS[name], [name]);
  if (!Component) {
    return (
      <div className="my-8 rounded-md border border-dashed border-bg-border bg-bg-subtle p-6 font-mono text-xs text-fg-subtle text-center">
        diagrama no encontrado: <span className="text-accent-red">{name}</span>
      </div>
    );
  }
  return (
    <figure className="my-12 -mx-4 sm:mx-0 rounded-md border border-bg-border bg-bg-subtle p-6 sm:p-8 overflow-x-auto">
      <Component className="w-full h-auto" />
      <figcaption className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-fg-faint">
        {name}
      </figcaption>
    </figure>
  );
}
