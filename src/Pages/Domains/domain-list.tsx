import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import "./domain-list.css";

const DomainsList = () => {
  const items = [
    {
      name: "Data Science",
      description: "A fantastic first item with amazing properties",
      icon: "🚀",
    },
    {
      name: "Health Sciences",
      description: "Second item that brings innovation to the table",
      icon: "🌟",
    },
    {
      name: "Policy",
      description: "Third item that stands out from the crowd",
      icon: "🔬",
    },
  ];

  return (
    <div className="items-container">
      <h2 className="items-header">Explore Our Collection</h2>
      <div className="items-grid">
        {items.map((item, index) => (
          <Link to={`/problem-page`} key={index} className="item-card">
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-3xl">{item.icon}</span>
                    {item.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <Button variant="outline" size="sm">
                  View Details
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DomainsList;
