package com.sems.entity;

public enum WorkerDesignation {
    CHEF("Chef"),
    KITCHEN_ASSISTANT("Kitchen Assistant"),
    WAITER("Waiter"),
    CASHIER("Cashier"),
    INVENTORY_WORKER("Inventory Worker"),
    DELIVERY_WORKER("Delivery Worker"),
    CLEANING_WORKER("Cleaning Worker");

    private final String label;

    WorkerDesignation(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static WorkerDesignation fromString(String text) {
        if (text == null || text.trim().isEmpty()) {
            return null;
        }
        String normalized = text.trim().toUpperCase().replace(" ", "_");
        for (WorkerDesignation d : WorkerDesignation.values()) {
            if (d.name().equalsIgnoreCase(normalized) || d.label.equalsIgnoreCase(text.trim())) {
                return d;
            }
        }
        return null;
    }
}
