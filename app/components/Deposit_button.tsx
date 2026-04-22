"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderCircle } from "lucide-react";
import axios from "axios";
import { BASE_URL } from "../utils/httpClient";
import { useToast } from "@/hooks/use-toast";


export default function DepositModal() {
  const { toast } = useToast()
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/order/onramp`, {
        amount,
        userId: "1",
      });
      console.log("response: ", response.data.message);
      toast({
        variant: "success",
        title: "Success!",
        description: "Money has been deposited successfully",
      })
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Failed to Deposit Money",
      })
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="inline-flex items-center justify-center h-8 px-4 text-xs font-medium rounded-md bg-white text-black hover:bg-white/90 transition-all duration-150 select-none font-semibold">
          Deposit
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[380px] text-white border border-white/10 bg-[#0a0a0a]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-white">
            Deposit funds
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.04] border border-white/10">
            <Label
              htmlFor="INR"
              className="flex text-sm items-center gap-3 cursor-pointer text-white w-full font-medium"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-white/10">
                <Image src="/usdc copy.webp" alt="INR" width={28} height={28} className="w-full h-full object-cover" />
              </div>
              <span className="text-sm">INR</span>
            </Label>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-[10px] font-medium uppercase tracking-widest text-white/30">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-lg h-11 font-mono text-sm bg-white/[0.04] border-white/10 text-white placeholder:text-white/25 focus:border-white/25 focus:ring-0"
            />
          </div>
        </div>
        <Button
          variant={"default"}
          onClick={handleClick}
          disabled={isLoading}
          data-loading={isLoading}
          className="group relative disabled:opacity-50 h-11 rounded-lg text-sm font-semibold bg-white text-black hover:bg-white/90"
        >
          <span className="group-data-[loading=true]:text-transparent">Deposit</span>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <LoaderCircle className="animate-spin" size={16} strokeWidth={2} aria-hidden="true" />
            </div>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
