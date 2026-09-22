import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: "https://farm-connect-backend-n7st.onrender.com/api/v1",
  },
};

export default nextConfig;
