/**
=========================================================
* Material Dashboard 2 React - Tailwind Version
=========================================================

* Tailwind CSS replacement for MDButton component
* Maintains exact same API and visual appearance
* 
=========================================================
*/

import { forwardRef } from "react";
import PropTypes from "prop-types";
import { twMerge } from "tailwind-merge";

const MDButton = forwardRef(
  ({ color, variant, size, circular, iconOnly, children, className, disabled, ...rest }, ref) => {
    // Base classes - common to all buttons
    const baseClasses = "font-bold inline-flex items-center justify-center transition-all duration-150 ease-in-out focus:outline-none active:opacity-85";

    // Size classes
    const sizeClasses = {
      small: iconOnly ? "w-8 h-8 min-w-8 p-0" : "px-4 py-2 text-xs leading-normal",
      medium: iconOnly ? "w-10 h-10 min-w-10 p-0" : "px-6 py-3 text-xs leading-normal",
      large: iconOnly ? "w-12 h-12 min-w-12 p-0" : "px-8 py-3.5 text-sm leading-normal",
    };

    // Border radius classes
    const shapeClasses = circular ? "rounded-full" : "rounded-lg";

    // Variant and color specific classes
    const getVariantColorClasses = () => {
      // CONTAINED VARIANT
      if (variant === "contained") {
        const containedColors = {
          white: "bg-white text-slate-700 shadow-md hover:shadow-xl",
          primary: "bg-pink-500 text-white shadow-md shadow-pink-500/40 hover:shadow-xl hover:shadow-pink-500/50",
          secondary: "bg-slate-500 text-white shadow-md shadow-slate-500/40 hover:shadow-xl hover:shadow-slate-500/50",
          info: "bg-blue-600 text-white shadow-md shadow-blue-600/40 hover:shadow-xl hover:shadow-blue-600/50",
          success: "bg-green-500 text-white shadow-md shadow-green-500/40 hover:shadow-xl hover:shadow-green-500/50",
          warning: "bg-orange-600 text-white shadow-md shadow-orange-600/40 hover:shadow-xl hover:shadow-orange-600/50",
          error: "bg-red-500 text-white shadow-md shadow-red-500/40 hover:shadow-xl hover:shadow-red-500/50",
          light: "bg-gray-100 text-slate-700 shadow-md hover:shadow-xl",
          dark: "bg-slate-700 text-white shadow-md shadow-slate-700/40 hover:shadow-xl hover:shadow-slate-700/50",
        };
        return containedColors[color] || containedColors.white;
      }

      // OUTLINED VARIANT
      if (variant === "outlined") {
        const outlinedColors = {
          white: "bg-transparent border-2 border-white/75 text-white hover:bg-transparent hover:border-white",
          primary: "bg-transparent border-2 border-pink-500 text-pink-500 hover:bg-transparent hover:border-pink-500",
          secondary: "bg-transparent border-2 border-slate-500 text-slate-500 hover:bg-transparent hover:border-slate-500",
          info: "bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-transparent hover:border-blue-600",
          success: "bg-transparent border-2 border-green-500 text-green-500 hover:bg-transparent hover:border-green-500",
          warning: "bg-transparent border-2 border-orange-600 text-orange-600 hover:bg-transparent hover:border-orange-600",
          error: "bg-transparent border-2 border-red-500 text-red-500 hover:bg-transparent hover:border-red-500",
          light: "bg-transparent border-2 border-gray-100 text-slate-700 hover:bg-transparent hover:border-gray-100",
          dark: "bg-transparent border-2 border-slate-700 text-slate-700 hover:bg-transparent hover:border-slate-700",
        };
        return outlinedColors[color] || outlinedColors.white;
      }

      // TEXT VARIANT
      if (variant === "text") {
        const textColors = {
          white: "bg-transparent text-white hover:bg-white/10",
          primary: "bg-transparent text-pink-500 hover:bg-pink-500/10",
          secondary: "bg-transparent text-slate-500 hover:bg-slate-500/10",
          info: "bg-transparent text-blue-600 hover:bg-blue-600/10",
          success: "bg-transparent text-green-500 hover:bg-green-500/10",
          warning: "bg-transparent text-orange-600 hover:bg-orange-600/10",
          error: "bg-transparent text-red-500 hover:bg-red-500/10",
          light: "bg-transparent text-slate-700 hover:bg-gray-100/10",
          dark: "bg-transparent text-slate-700 hover:bg-slate-700/10",
        };
        return textColors[color] || textColors.white;
      }

      // GRADIENT VARIANT
      if (variant === "gradient") {
        const gradientColors = {
          white: "bg-white text-slate-700 shadow-md hover:shadow-xl",
          primary: "bg-gradient-to-tl from-pink-600 to-pink-400 text-white shadow-md shadow-pink-500/40 hover:shadow-xl hover:shadow-pink-500/50",
          secondary: "bg-gradient-to-tl from-slate-600 to-slate-400 text-white shadow-md shadow-slate-500/40 hover:shadow-xl hover:shadow-slate-500/50",
          info: "bg-gradient-to-tl from-blue-600 to-blue-400 text-white shadow-md shadow-blue-600/40 hover:shadow-xl hover:shadow-blue-600/50",
          success: "bg-gradient-to-tl from-green-600 to-green-400 text-white shadow-md shadow-green-500/40 hover:shadow-xl hover:shadow-green-500/50",
          warning: "bg-gradient-to-tl from-orange-600 to-orange-400 text-white shadow-md shadow-orange-600/40 hover:shadow-xl hover:shadow-orange-600/50",
          error: "bg-gradient-to-tl from-red-600 to-red-400 text-white shadow-md shadow-red-500/40 hover:shadow-xl hover:shadow-red-500/50",
          light: "bg-gradient-to-tl from-gray-300 to-gray-100 text-slate-700 shadow-md hover:shadow-xl",
          dark: "bg-gradient-to-tl from-slate-800 to-slate-600 text-white shadow-md shadow-slate-700/40 hover:shadow-xl hover:shadow-slate-700/50",
        };
        return gradientColors[color] || gradientColors.white;
      }

      // Default to contained
      return "bg-white text-slate-700 shadow-md hover:shadow-xl";
    };

    // Disabled state
    const disabledClasses = disabled ? "opacity-60 cursor-not-allowed pointer-events-none" : "cursor-pointer";

    // Combine all classes
    const buttonClasses = twMerge(
      baseClasses,
      sizeClasses[size] || sizeClasses.medium,
      shapeClasses,
      getVariantColorClasses(),
      disabledClasses,
      className
    );

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

// Display name for debugging
MDButton.displayName = "MDButton";

// Setting default values for the props of MDButton
MDButton.defaultProps = {
  size: "medium",
  variant: "contained",
  color: "white",
  circular: false,
  iconOnly: false,
  disabled: false,
  className: "",
};

// Typechecking props for the MDButton
MDButton.propTypes = {
  size: PropTypes.oneOf(["small", "medium", "large"]),
  variant: PropTypes.oneOf(["text", "contained", "outlined", "gradient"]),
  color: PropTypes.oneOf([
    "white",
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
  circular: PropTypes.bool,
  iconOnly: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default MDButton;
