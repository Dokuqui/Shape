'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styled, { css } from 'styled-components';
import Link from 'next/link';
import { FaHome, FaCalendar, FaImage, FaBlog, FaUsers, FaBars, FaTimes } from 'react-icons/fa';

const Container = styled.div`
  display: flex;
  height: 100vh;
  background: #f4f7fa;
  overflow: hidden;
`;

const Sidebar = styled.aside.withConfig({
  shouldForwardProp: (prop) => prop !== 'isOpen',
})<{ isOpen: boolean }>`
  width: 240px;
  background: linear-gradient(180deg, #2a2a3c 0%, #1e1e2f 100%);
  color: white;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 1000;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  @media (max-width: 768px) {
    transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(-100%)')};
  }
`;

const Backdrop = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isOpen',
})<{ isOpen: boolean }>`
  position: fixed;
  display: none;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 900;

  ${({ isOpen }) =>
    isOpen &&
    css`
      display: block;
    `}
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const SidebarTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;


const Nav = styled.nav`
  margin-top: 2rem;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-bottom: 0.5rem;
`;

const NavLink = styled(Link).withConfig({
  shouldForwardProp: (prop) => prop !== 'isActive',
}) <{ isActive: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: ${({ isActive }) => (isActive ? '#ffffff' : '#b0b0c0')};
  text-decoration: none;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }

  ${({ isActive }) =>
    isActive &&
    `
    background: #007bff;
    color: #ffffff;
  `}

  svg {
    margin-right: 0.75rem;
    font-size: 1.2rem;
  }
`;

const Main = styled.main`
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
`;

const LogoutButton = styled.button`
  background: #ff4d4f;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background: #d9363e;
  }
`;

const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #2a2a3c;
  font-size: 1.5rem;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
`;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/admin/connection');
  };

  const navItems = [
    { href: '/admin/dashboard', label: 'Home', icon: FaHome },
    { href: '/admin/events', label: 'Events', icon: FaCalendar },
    { href: '/admin/photos', label: 'Gallery', icon: FaImage },
    { href: '/admin/people', label: 'Members', icon: FaUsers },
    { href: '/admin/blog', label: 'Blog', icon: FaBlog },
  ];

  if (pathname === '/admin/connection') {
    return <>{children}</>;
  }

  return (
    <>
      <Container>
        <Sidebar isOpen={isSidebarOpen}>
          <SidebarHeader>
            <SidebarTitle>Admin Panel</SidebarTitle>
            <CloseButton onClick={() => setSidebarOpen(false)}>
              <FaTimes />
            </CloseButton>
          </SidebarHeader>
          <Nav>
            <NavList>
              {navItems.map((item) => (
                <NavItem key={item.href}>
                  <NavLink
                    href={item.href}
                    isActive={pathname === item.href}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon />
                    {item.label}
                  </NavLink>
                </NavItem>
              ))}
            </NavList>
          </Nav>
        </Sidebar>

        <Main>
          <Header>
            <HamburgerButton onClick={() => setSidebarOpen(true)}>
              <FaBars />
            </HamburgerButton>
            <h1>Dashboard</h1>
            <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
          </Header>
          <div style={{ padding: '1rem' }}>{children}</div>
        </Main>
      </Container>

      <Backdrop isOpen={isSidebarOpen} onClick={() => setSidebarOpen(false)} />
    </>
  );
}
