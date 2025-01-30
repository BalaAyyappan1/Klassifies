export interface Subcategory2 {
    id: number;
    name: string;
  }
  
  export interface Subcategory {
    id: number;
    name: string;
    subcategories2: Subcategory2[];
  }
  
  export interface MainCategory {
    id: number;
    name: string;
    subcategories: Subcategory[];
  }
  
  export interface CategoryData {
    mainCategories: MainCategory[];
  }