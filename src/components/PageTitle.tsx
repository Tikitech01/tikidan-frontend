import React from 'react';
import { Breadcrumb, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  icon?: string;
  showBreadcrumb?: boolean;
  breadcrumbItems?: { label: string; path?: string }[];
}

const PageTitle: React.FC<PageTitleProps> = ({
  title,
  subtitle,
  icon = 'mdi:view-dashboard',
  showBreadcrumb = true,
  breadcrumbItems = []
}) => {
  return (
    <div className="page-title">
      <Container fluid>
        <div className="d-flex align-items-center mb-3">
          {icon && (
            <Icon 
              icon={icon} 
              width="32" 
              height="32" 
              className="text-primary me-3" 
            />
          )}
          <div>
            <h2 className="page-title-text mb-0">{title}</h2>
            {subtitle && (
              <p className="page-subtitle text-muted mb-0">{subtitle}</p>
            )}
          </div>
        </div>
        
        {showBreadcrumb && (
          <Breadcrumb>
            <Breadcrumb.Item as={Link} to="/reports">
              Dashboard
            </Breadcrumb.Item>
            {breadcrumbItems.map((item, index) => (
              item.path ? (
                <Breadcrumb.Item
                  key={index}
                  as={Link}
                  to={item.path}
                >
                  {item.label}
                </Breadcrumb.Item>
              ) : (
                <Breadcrumb.Item
                  key={index}
                  active
                >
                  {item.label}
                </Breadcrumb.Item>
              )
            ))}
            <Breadcrumb.Item active>{title}</Breadcrumb.Item>
          </Breadcrumb>
        )}
      </Container>
    </div>
  );
};

export default PageTitle;