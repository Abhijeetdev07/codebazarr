"use client";

import { useState } from "react";
import { paymentAPI } from "@/lib/api";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Define Razorpay options interface
interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    image?: string;
    order_id: string;
    handler: (response: any) => void;
    prefill: {
        name: string;
        email: string;
        contact?: string;
    };
    theme: {
        color: string;
    };
    modal?: {
        ondismiss: () => void;
    };
}

// Extend window interface to include Razorpay
declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => any;
    }
}

export const useRazorpay = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const { user } = useAuth();
    const router = useRouter();

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (typeof window.Razorpay !== "undefined") {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async (projectId: string) => {
        if (!user) {
            toast.error("Please login to continue");
            router.push(`/login?redirect=/projects/${projectId}`);
            return;
        }

        setIsProcessing(true);

        try {
            // 1. Load Script
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                toast.error("Failed to load payment gateway. Please check your internet connection.");
                setIsProcessing(false);
                return;
            }

            // 2. Create Order on Backend
            const orderResponse = await paymentAPI.createOrder(projectId);
            if (!orderResponse.data.success) {
                throw new Error(orderResponse.data.message || "Failed to create order");
            }

            const { id: orderId, currency, amount, keyId, project } = orderResponse.data.data;

            // 3. Initialize Razorpay Options
            const options: RazorpayOptions = {
                key: keyId,
                amount: amount,
                currency: currency,
                name: "CodeBazar",
                description: `Purchase: ${project.title}`,
                image: "https://via.placeholder.com/150",
                order_id: orderId,
                handler: async function (response: any) {
                    // 4. Verify Payment on Backend
                    try {
                        const verifyResponse = await paymentAPI.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            projectId: projectId
                        });

                        if (verifyResponse.data.success) {
                            toast.success("Payment Successful!");
                            router.push("/dashboard");
                        } else {
                            toast.error("Payment verification failed");
                        }
                    } catch (error: any) {
                        console.error("Verification Error", error);
                        toast.error(error.response?.data?.message || "Payment verification failed");
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                theme: {
                    color: "#4F46E5", // Indigo-600
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessing(false);
                        toast("Payment cancelled");
                    }
                }
            };

            // 5. Open Razorpay Modal
            const rzp1 = new window.Razorpay(options);
            rzp1.on("payment.failed", function (response: any) {
                toast.error(response.error.description || "Payment failed");
                // Persist failed payment attempt so admin can see it
                const orderId =
                    response?.error?.metadata?.order_id ||
                    response?.error?.metadata?.razorpay_order_id ||
                    response?.error?.metadata?.orderId;

                const paymentId =
                    response?.error?.metadata?.payment_id ||
                    response?.error?.metadata?.razorpay_payment_id ||
                    response?.error?.metadata?.paymentId;

                if (orderId) {
                    paymentAPI
                        .markFailed({
                            razorpay_order_id: orderId,
                            razorpay_payment_id: paymentId,
                            projectId,
                        })
                        .catch((err: any) => {
                            console.error("Failed to record failed payment", err);
                        });
                }
                setIsProcessing(false);
            });
            rzp1.open();

        } catch (error: any) {
            // Handle "Already Purchased" specifically
            if (error.response?.status === 400 && error.response?.data?.message?.includes('already purchased')) {
                toast.error("You own this project! Redirecting to dashboard...");
                router.push("/dashboard");
                setIsProcessing(false);
                return;
            }

            console.error("Payment Error:", error);
            toast.error(error.response?.data?.message || error.message || "Something went wrong");
            setIsProcessing(false);
        }
    };

    return { handlePayment, isProcessing };
};
