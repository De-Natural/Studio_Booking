"use client";

import { useEffect, useRef, useCallback } from "react";
import { Loader2, CreditCard } from "lucide-react";

interface PaystackButtonProps {
  email: string;
  amount: number;       // amount in kobo
  reference: string;
  publicKey: string;
  label?: string;
  disabled?: boolean;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function PaystackButton({
  email,
  amount,
  reference,
  publicKey,
  label = "Pay Now",
  disabled = false,
  onSuccess,
  onClose,
}: PaystackButtonProps) {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current || typeof window === "undefined") return;

    // Check if script already exists
    if (document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')) {
      scriptLoaded.current = true;
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => {
      scriptLoaded.current = true;
    };
    document.head.appendChild(script);
  }, []);

  const handlePay = useCallback(() => {
    if (!window.PaystackPop) {
      alert("Payment system is still loading. Please try again.");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email,
      amount,
      ref: reference,
      currency: "NGN",
      onClose: () => {
        onClose();
      },
      callback: (response: { reference: string }) => {
        onSuccess(response.reference);
      },
    });

    handler.openIframe();
  }, [publicKey, email, amount, reference, onClose, onSuccess]);

  return (
    <button
      type="button"
      onClick={handlePay}
      disabled={disabled}
      className="w-full py-3.5 rounded-xl text-white font-semibold gradient-accent shadow-md disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300"
    >
      {disabled ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <CreditCard className="w-4 h-4" />
      )}
      {label}
    </button>
  );
}
