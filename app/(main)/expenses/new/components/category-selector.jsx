"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CategorySelector({ categories, onChange }) {
  const [selectedCategory, setSelectedCategory] = useState("");

  // Set default category when component mounts or categories change
  useEffect(() => {
    if (!selectedCategory && categories && categories.length > 0) {
      const defaultCategory =
        categories.find((cat) => cat.isDefault) || categories[0];
      setSelectedCategory(defaultCategory.id);
      if (onChange) {
        onChange(defaultCategory.id);
      }
    }
  }, [categories, selectedCategory, onChange]);

  // Handle when a category is selected manually
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    if (onChange && categoryId !== selectedCategory) {
      onChange(categoryId);
    }
  };

  // If no categories or empty categories array
  if (!categories || categories.length === 0) {
    return <div>No categories available</div>;
  }

  return (
    <Select value={selectedCategory} onValueChange={handleCategoryChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            <div className="flex items-center gap-2">
              <span>{category.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

