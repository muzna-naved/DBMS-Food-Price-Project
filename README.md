# Smart Food Price Monitoring System

A web-based application designed to monitor, compare, and analyze essential food prices across different cities of Pakistan.

**Live Demo:** [Smart Food Price Monitoring System](https://smart-food-price-monitoring.vercel.app/)

## Project Overview

The Smart Food Price Monitoring System helps users explore food prices across multiple cities in Pakistan. It provides minimum, average, and maximum prices for essential food products using data from the Pakistan Bureau of Statistics (PBS).

The project demonstrates how database management, API integration, and web technologies can be combined to create a practical data-driven application.

## Objectives

- Monitor essential food prices across Pakistan.
- Compare product prices between different cities.
- Provide easy access to minimum, average, and maximum prices.
- Store and manage food price records using a relational database.
- Present price information through an interactive dashboard.

## Key Features

- **Latest Food Prices:** View minimum, average, and maximum prices.
- **City Comparison:** Compare the prices of a selected product across different cities.
- **Product Search:** Search for food products and view their price records.
- **Price Visualization:** Explore price comparisons through interactive charts.
- **City and Product Filters:** Select specific cities and products to view relevant information.

## Dataset

The system uses food price data from the **Pakistan Bureau of Statistics (PBS)**.

Current dataset includes:
- 12 Categories
- 32 Food Products
- 17 Cities
- 544 Price Records

## Technologies Used

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Charts | Chart.js |
| Backend | Python Flask |
| Database | MySQL |
| API | Flask REST API |
| Database Hosting | Aiven Cloud |
| Deployment | Vercel |

## System Architecture

The application follows this data flow:

```text
PBS Food Price Data
        ↓
   MySQL Database
        ↓
    Flask REST API
        ↓
  Frontend Dashboard
        ↓
  User Interaction
```

## Database Design

The relational database consists of four main tables:

- **Categories:** Stores food product categories.
- **Products:** Stores product names, units, and category references.
- **Cities:** Stores city names and provinces.
- **Price Records:** Stores minimum, average, and maximum prices for products across cities on specific dates.

Foreign keys establish relationships between the tables, helping maintain referential integrity.

## Live Application

Visit the deployed application:

[https://smart-food-price-monitoring.vercel.app/](https://smart-food-price-monitoring.vercel.app/)

## Project Purpose

Developed as an academic Database Management System (DBMS) project to demonstrate relational database design, SQL, backend API development, data integration, and frontend development.
