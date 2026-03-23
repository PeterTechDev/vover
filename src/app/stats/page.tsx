import { Metadata } from "next";
import { StatsClient } from "./stats-client";

export const metadata: Metadata = {
  title: "Your Stats",
  description: "Your personal movie and TV watching statistics on Vover.",
};

export default function StatsPage() {
  return <StatsClient />;
}
