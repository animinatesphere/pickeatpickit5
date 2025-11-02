module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["Open Sans", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      keyframes: {
        "slide-in": {
          from: {
            transform: "translateX(400px)",
            opacity: "0",
          },
          to: {
            transform: "translateX(0)",
            opacity: "1",
          },
        },
      },
      animation: {
        "slide-in": "slide-in 0.3s ease-out",
      },
    },
  },
};
