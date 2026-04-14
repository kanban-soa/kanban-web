```
src
├── /app          # Root application setup, routing, and providers
├── /assets       # Static files like images, fonts, and global CSS
├── /components   # Reusable, general-purpose UI components (e.g., Button, Modal)
├── /features     # Logic and components grouped by functionality (e.g., authentication, user profile)
├── /hooks        # Reusable custom hooks used across multiple features
├── /lib          # Third-party library integrations or facades
├── /pages        # Simple files that combine features and components to form complete pages
├── /services     # Code for interacting with external APIs or backend services
├── /styles       # Global styles and theme configurations
├── /types        # TypeScript interfaces and types shared across the project
└── /utils        # Generic, pure utility functions (e.g., date formatters)
```
> [!NOTE]
> Thêm navigator theo sidebar/app-sidebar.tsx (chứ sidebar chính)
>
> Với mỗi navigator sử dụng router của nextjs để nav
>
> Component thêm mới nên để trong thư mục. VD: sidebar
>
> Tham khảo code tại 'https://github.com/kanbn/kan/blob/main/apps/web/src/components/SideNavigation.tsx'
>
> Do đã refractor lại structure nên lưu ý
