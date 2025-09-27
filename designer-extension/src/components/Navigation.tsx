"use client"

import { useState, useEffect } from "react"
// import Link from "next/link" // Not needed in Vite
// import Image from "next/image" // Not needed in Vite
// import { MobileMenu } from "./mobile-menu"
import ConnectWalletButton from "./connect-wallet-button"
// import NotificationIcon from "./notification-icon"
import { useActiveAccount } from "thirdweb/react"

interface NavigationProps {
  activePage?: "home" | "about" | "nfts" | "sell" | "my-nfts" | "contact"
}

export default function Navigation({ activePage = "home" }: NavigationProps) {
  const account = useActiveAccount()

  return (
    <header className="border-b border-neutral-700 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between bg-background fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center">
        <a href="/" className="flex items-center">
          <img
            src="/retinal_delights-horizontal-brand-offwhite.svg"
            alt="Retinal Delights"
            className="w-auto h-10 sm:h-12 md:h-14 max-h-14"
          />
        </a>
      </div>
      <nav className="hidden lg:flex items-center gap-6 lg:gap-7 xl:gap-8 absolute left-1/2 transform -translate-x-1/2">
        <a
          href="/"
          className={`text-base font-medium relative group ${
            activePage === "home" ? "text-[#ff0099]" : "text-neutral-400 hover:text-[#fffbeb]"
          }`}
        >
          HOME
          <span className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ease-out ${
            activePage === "home" ? "w-full" : "w-0 group-hover:w-full"
          }`} style={{ backgroundColor: activePage === "home" ? "#ff0099" : "#fffbeb" }}></span>
        </a>
        <a
          href="/about"
          className={`text-base font-medium relative group ${
            activePage === "about" ? "text-[#ff0099]" : "text-neutral-400 hover:text-[#fffbeb]"
          }`}
        >
          ABOUT
          <span className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ease-out ${
            activePage === "about" ? "w-full" : "w-0 group-hover:w-full"
          }`} style={{ backgroundColor: activePage === "about" ? "#ff0099" : "#fffbeb" }}></span>
        </a>
        <a
          href="/nfts"
          className={`text-base font-medium relative group ${
            activePage === "nfts" ? "text-[#ff0099]" : "text-neutral-400 hover:text-[#fffbeb]"
          }`}
        >
          NFTS
          <span className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ease-out ${
            activePage === "nfts" ? "w-full" : "w-0 group-hover:w-full"
          }`} style={{ backgroundColor: activePage === "nfts" ? "#ff0099" : "#fffbeb" }}></span>
        </a>
        <a
          href="/sell"
          className={`text-base font-medium relative group ${
            activePage === "sell" ? "text-[#ff0099]" : "text-neutral-400 hover:text-[#fffbeb]"
          }`}
        >
          SELL
          <span className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ease-out ${
            activePage === "sell" ? "w-full" : "w-0 group-hover:w-full"
          }`} style={{ backgroundColor: activePage === "sell" ? "#ff0099" : "#fffbeb" }}></span>
        </a>
        <a
          href="/contact"
          className={`text-base font-medium relative group ${
            activePage === "contact" ? "text-[#ff0099]" : "text-neutral-400 hover:text-[#fffbeb]"
          }`}
        >
          CONTACT
          <span className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ease-out ${
            activePage === "contact" ? "w-full" : "w-0 group-hover:w-full"
          }`} style={{ backgroundColor: activePage === "contact" ? "#ff0099" : "#fffbeb" }}></span>
        </a>
        {account && (
          <a
            href="/my-nfts"
            className={`text-base font-medium relative group ${
              activePage === "my-nfts" ? "text-[#ff0099]" : "text-neutral-400 hover:text-[#fffbeb]"
            }`}
          >
            MY NFTS
            <span className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ease-out ${
              activePage === "my-nfts" ? "w-full" : "w-0 group-hover:w-full"
            }`} style={{ backgroundColor: activePage === "my-nfts" ? "#ff0099" : "#fffbeb" }}></span>
          </a>
        )}
      </nav>
        <div className="flex items-center gap-3">
                  {account && (
                    <div className="hidden lg:block">
                      {/* <NotificationIcon /> */}
                    </div>
                  )}
          <div className="hidden lg:block">
            <ConnectWalletButton />
          </div>
          {/* <MobileMenu isWalletConnected={!!account} /> */}
        </div>
    </header>
  )
}