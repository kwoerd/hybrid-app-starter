import React from 'react';
import { Twitter, Discord, Github, Mail, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

export default function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-border-primary mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-brand-pink rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">SS</span>
              </div>
              <h3 className="text-xl font-bold" style={{ color: "#fffbeb" }}>
                SATOSHE SLUGGERS
              </h3>
            </div>
            <p className="text-text-secondary text-sm">
              A RETINAL DELIGHTS NFT MARKETPLACE
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-text-muted hover:text-brand-pink">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-text-muted hover:text-brand-pink">
                <Discord className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-text-muted hover:text-brand-pink">
                <Github className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-text-muted hover:text-brand-pink">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Marketplace */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-text-primary">Marketplace</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Button variant="link" className="p-0 h-auto text-text-secondary hover:text-brand-pink">
                  Browse NFTs
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-text-secondary hover:text-brand-pink">
                  Collections
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-text-secondary hover:text-brand-pink">
                  Activity
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-text-secondary hover:text-brand-pink">
                  Rankings
                </Button>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-text-primary">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Button variant="link" className="p-0 h-auto text-text-secondary hover:text-brand-pink">
                  Help Center
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-text-secondary hover:text-brand-pink">
                  Platform Status
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-text-secondary hover:text-brand-pink">
                  Partners
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-text-secondary hover:text-brand-pink">
                  Blog
                </Button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-text-primary">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Button variant="link" className="p-0 h-auto text-text-secondary hover:text-brand-pink">
                  About
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-text-secondary hover:text-brand-pink">
                  Careers
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-text-secondary hover:text-brand-pink">
                  Privacy Policy
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-text-secondary hover:text-brand-pink">
                  Terms of Service
                </Button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border-primary mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-text-muted text-sm">
              © 2024 Satoshe Sluggers. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-sm text-text-muted">
              <span>Powered by</span>
              <Button variant="link" className="p-0 h-auto text-brand-pink hover:text-brand-pink-hover">
                thirdweb
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
              <span>•</span>
              <Button variant="link" className="p-0 h-auto text-brand-pink hover:text-brand-pink-hover">
                Webflow
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}