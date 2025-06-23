// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { BookOpen, Users, BarChart3, Settings, Plus, Home } from "lucide-react";

// interface NavigationItem {
//   name: string;
//   href: string;
//   icon: React.ComponentType<{ className?: string }>;
// }

// const navigation: NavigationItem[] = [
//   { name: "Dashboard", href: "/dashboard/formateur", icon: Home },
//   { name: "Mes Formations", href: "/dashboard/formateur/formations", icon: BookOpen },
//   { name: "Étudiants", href: "/dashboard/formateur/students", icon: Users },
//   { name: "Analytics", href: "/dashboard/formateur/analytics", icon: BarChart3 },
//   { name: "Paramètres", href: "/dashboard/formateur/settings", icon: Settings },
// ];

// export default function FormateurNavigation() {
//   const pathname = usePathname();

//   return (
//     <nav className="space-y-1">
//       {navigation.map((item) => {
//         const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
//         return (
//           <Link
//             key={item.name}
//             href={item.href}
//             className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
//               isActive
//                 ? "bg-blue-100 text-blue-700"
//                 : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//             }`}
//           >
//             <item.icon
//               className={`mr-3 h-5 w-5 flex-shrink-0 ${
//                 isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
//               }`}
//             />
//             {item.name}
//           </Link>
//         );
//       })}

//       {/* Action rapide */}
//       <div className="pt-4 mt-4 border-t border-gray-200">
//         <Link
//           href="/dashboard/formateur/formations/create"
//           className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
//         >
//           <Plus className="mr-3 h-5 w-5 flex-shrink-0" />
//           Nouvelle Formation
//         </Link>
//       </div>
//     </nav>
//   );
// } 