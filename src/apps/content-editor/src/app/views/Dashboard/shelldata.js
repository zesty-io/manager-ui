export default {
  shellBarData: function() {
    return {
      labels: [
        "Loading",
        "Loading",
        "Loading",
        "Loading",
        "Loading",
        "Loading",
        "Loading"
      ],
      datasets: [
        {
          label: "Loading",
          backgroundColor: "rgba(0,0,0,0.2)",
          borderColor: "rgba(0,0,0,0,1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(0,0,0,0,0.4)",
          hoverBorderColor: "rgba(0,0,0,0,1)",
          data: [0, 0, 0, 0, 0, 0, 0]
        }
      ]
    };
  },
  shellDoughnutData: function() {
    return {
      labels: ["Loading", "Loading", "Loading"],
      datasets: [
        {
          data: [20, 20, 20],
          backgroundColor: [
            "rgba(0,0,0,0,0.4)",
            "rgba(0,0,0,0,0.4)",
            "rgba(0,0,0,0,0.4)"
          ],
          hoverBackgroundColor: [
            "rgba(0,0,0,0,0.7)",
            "rgba(0,0,0,0,0.7)",
            "rgba(0,0,0,0,0.7)"
          ]
        }
      ]
    };
  }
};
