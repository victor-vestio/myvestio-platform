import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Zap,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface NavbarProps {
  smoothScrollTo?: (elementId: string) => void;
}

export function Navbar({ smoothScrollTo }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const navigate = useNavigate();

  const handleSmoothScrollTo = (elementId: string) => {
    setIsMenuOpen(false);
    if (smoothScrollTo) {
      smoothScrollTo(elementId);
    }
  };

  const handleNavigation = (path: string) => {
    setIsMenuOpen(false);
    setSolutionsOpen(false);
    setResourcesOpen(false);
    navigate(path);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">VESTIO</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {/* About */}
          <motion.button
            onClick={() => handleNavigation('/about')}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer relative"
            whileHover={{
              scale: 1.05,
              color: "rgb(var(--primary))",
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            About
            <motion.div
              className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary origin-left"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>

          {/* Solutions Dropdown */}
          <div className="relative"
               onMouseEnter={() => setSolutionsOpen(true)}
               onMouseLeave={() => setSolutionsOpen(false)}>
            <motion.button
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer relative flex items-center gap-1"
              whileHover={{
                scale: 1.05,
                color: "rgb(var(--primary))",
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              Solutions
              <ChevronDown className={`w-4 h-4 transition-transform ${solutionsOpen ? 'rotate-180' : ''}`} />
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary origin-left"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
            
            {solutionsOpen && (
              <motion.div
                className="absolute top-full left-0 mt-2 w-48 bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-lg py-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => handleSmoothScrollTo('solutions')}
                  className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Businesses (Sellers)
                </button>
                <button
                  onClick={() => handleSmoothScrollTo('solutions')}
                  className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Businesses (Anchors)
                </button>
                <button
                  onClick={() => handleSmoothScrollTo('solutions')}
                  className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Investors (Lenders)
                </button>
              </motion.div>
            )}
          </div>

          {/* Resources Dropdown */}
          <div className="relative"
               onMouseEnter={() => setResourcesOpen(true)}
               onMouseLeave={() => setResourcesOpen(false)}>
            <motion.button
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer relative flex items-center gap-1"
              whileHover={{
                scale: 1.05,
                color: "rgb(var(--primary))",
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              Resources
              <ChevronDown className={`w-4 h-4 transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} />
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary origin-left"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
            
            {resourcesOpen && (
              <motion.div
                className="absolute top-full left-0 mt-2 w-32 bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-lg py-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => handleNavigation('/blog')}
                  className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Blog
                </button>
                <button
                  onClick={() => handleNavigation('/blog')}
                  className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Demo
                </button>
                <button
                  onClick={() => handleSmoothScrollTo('faq')}
                  className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  FAQs
                </button>
              </motion.div>
            )}
          </div>

          {/* Contact */}
          <motion.button
            onClick={() => handleNavigation('/contact')}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer relative"
            whileHover={{
              scale: 1.05,
              color: "rgb(var(--primary))",
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            Contact
            <motion.div
              className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary origin-left"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
          <motion.div
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 25px rgba(var(--primary), 0.3)",
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, type: "spring" }}
          >
            <Button className="relative overflow-hidden group">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/20 via-white/20 to-primary/20"
                animate={{
                  x: [-100, 100],
                  transition: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  },
                }}
              />
              Get Started
            </Button>
          </motion.div>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            animate={{ rotate: isMenuOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </motion.div>
        </motion.button>
      </div>

      {/* Mobile Navigation Overlay */}
      <motion.div
        className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border"
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: isMenuOpen ? 1 : 0,
          height: isMenuOpen ? "auto" : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ overflow: "hidden" }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4">
            {/* About */}
            <motion.button
              onClick={() => handleNavigation('/about')}
              className="text-left py-3 px-4 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 border border-transparent hover:border-primary/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: isMenuOpen ? 1 : 0,
                x: isMenuOpen ? 0 : -20,
              }}
              transition={{
                delay: isMenuOpen ? 0.1 : 0,
                duration: 0.3,
              }}
              whileTap={{ scale: 0.98 }}
            >
              About
            </motion.button>

            {/* Solutions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: isMenuOpen ? 1 : 0,
                x: isMenuOpen ? 0 : -20,
              }}
              transition={{
                delay: isMenuOpen ? 0.2 : 0,
                duration: 0.3,
              }}
            >
              <button
                onClick={() => setSolutionsOpen(!solutionsOpen)}
                className="w-full text-left py-3 px-4 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 border border-transparent hover:border-primary/20 flex items-center justify-between"
              >
                Solutions
                <ChevronDown className={`w-4 h-4 transition-transform ${solutionsOpen ? 'rotate-180' : ''}`} />
              </button>
              {solutionsOpen && (
                <div className="ml-4 mt-2 space-y-2">
                  <button
                    onClick={() => handleSmoothScrollTo('solutions')}
                    className="w-full text-left py-2 px-4 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                  >
                    Businesses (Sellers)
                  </button>
                  <button
                    onClick={() => handleSmoothScrollTo('solutions')}
                    className="w-full text-left py-2 px-4 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                  >
                    Businesses (Anchors)
                  </button>
                  <button
                    onClick={() => handleSmoothScrollTo('solutions')}
                    className="w-full text-left py-2 px-4 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                  >
                    Investors (Lenders)
                  </button>
                </div>
              )}
            </motion.div>

            {/* Resources */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: isMenuOpen ? 1 : 0,
                x: isMenuOpen ? 0 : -20,
              }}
              transition={{
                delay: isMenuOpen ? 0.3 : 0,
                duration: 0.3,
              }}
            >
              <button
                onClick={() => setResourcesOpen(!resourcesOpen)}
                className="w-full text-left py-3 px-4 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 border border-transparent hover:border-primary/20 flex items-center justify-between"
              >
                Resources
                <ChevronDown className={`w-4 h-4 transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} />
              </button>
              {resourcesOpen && (
                <div className="ml-4 mt-2 space-y-2">
                  <button
                    onClick={() => handleNavigation('/blog')}
                    className="w-full text-left py-2 px-4 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                  >
                    Blog
                  </button>
                  <button
                    onClick={() => handleSmoothScrollTo('faq')}
                    className="w-full text-left py-2 px-4 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                  >
                    FAQs
                  </button>
                </div>
              )}
            </motion.div>

            {/* Contact */}
            <motion.button
              onClick={() => handleNavigation('/contact')}
              className="text-left py-3 px-4 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 border border-transparent hover:border-primary/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: isMenuOpen ? 1 : 0,
                x: isMenuOpen ? 0 : -20,
              }}
              transition={{
                delay: isMenuOpen ? 0.4 : 0,
                duration: 0.3,
              }}
              whileTap={{ scale: 0.98 }}
            >
              Contact
            </motion.button>

            {/* Mobile Get Started Button */}
            <motion.div
              className="pt-4 border-t border-border/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isMenuOpen ? 1 : 0,
                y: isMenuOpen ? 0 : 20,
              }}
              transition={{
                delay: isMenuOpen ? 0.5 : 0,
                duration: 0.3,
              }}
            >
              <Button className="w-full relative overflow-hidden group">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/20 via-white/20 to-primary/20"
                  animate={{
                    x: [-100, 100],
                    transition: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    },
                  }}
                />
                Get Started
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
}