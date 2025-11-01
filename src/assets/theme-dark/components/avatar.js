/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: Market Maker Zw
* Copyright 2025 Market Maker Zw

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// Material Dashboard 2 React base styles
import borders from "assets/theme-dark/base/borders";

const { borderRadius } = borders;

const avatar = {
  styleOverrides: {
    root: {
      transition: "all 200ms ease-in-out",
    },

    rounded: {
      borderRadius: borderRadius.lg,
    },

    img: {
      height: "auto",
    },
  },
};

export default avatar;
