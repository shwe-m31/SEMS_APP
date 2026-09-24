import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, attendanceAPI, restaurantAPI } from '../services/api';
import AppShell from '../components/AppShell';
import './Dashboard.css';

function WorkerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Issue Reporting Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingIssue, setReportingIssue] = useState(false);
  const [issueForm, setIssueForm] = useState({
    category: 'EQUIPMENT_MALFUNCTION',
    description: ''
  });

  // Waiter: Table Order Creation Modal State
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [tableNumber, setTableNumber] = useState('Table 1');
  const [customerName, setCustomerName] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [itemQuantities, setItemQuantities] = useState({});
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Cashier: Payment Settle & Receipt Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedOrderToPay, setSelectedOrderToPay] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paidReceipt, setPaidReceipt] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getWorkerDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    setMarkingAttendance(true);
    try {
      await attendanceAPI.mark({
        workerId: dashboardData?.worker?.id,
        branchId: dashboardData?.worker?.branch?.id,
        checkInTime: new Date().toTimeString().split(' ')[0],
        status: 'PRESENT'
      });
      alert('Attendance recorded successfully.');
      fetchDashboardData();
    } catch (error) {
      alert('Failed to record attendance: ' + (error.response?.data?.message || error.message));
    } finally {
      setMarkingAttendance(false);
    }
  };

  // CHEF Actions
  const handleAcceptOrder = async (orderId) => {
    setActionLoading(`accept-${orderId}`);
    try {
      await restaurantAPI.acceptOrder(orderId);
      await fetchDashboardData();
    } catch (error) {
      alert('Failed to accept order: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartOrder = async (orderId) => {
    setActionLoading(`start-${orderId}`);
    try {
      await restaurantAPI.startOrder(orderId);
      await fetchDashboardData();
    } catch (error) {
      alert('Failed to start preparation: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReadyOrder = async (orderId) => {
    setActionLoading(`ready-${orderId}`);
    try {
      await restaurantAPI.readyOrder(orderId);
      await fetchDashboardData();
    } catch (error) {
      alert('Failed to mark order ready: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  // WAITER Actions
  const handleServeOrder = async (orderId) => {
    setActionLoading(`serve-${orderId}`);
    try {
      await restaurantAPI.serveOrder(orderId);
      await fetchDashboardData();
    } catch (error) {
      alert('Failed to serve order: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenOrderModal = async () => {
    try {
      const res = await restaurantAPI.getMenu();
      setMenuItems(res.data || []);
      setItemQuantities({});
      setOrderNotes('');
      setCustomerName('');
      setTableNumber('Table 1');
      setOrderModalOpen(true);
    } catch (error) {
      alert('Failed to load restaurant menu: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleQuantityChange = (productId, delta) => {
    setItemQuantities(prev => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  const calculateOrderSubtotal = () => {
    return Object.entries(itemQuantities).reduce((sum, [pId, qty]) => {
      const item = menuItems.find(m => m.id === parseInt(pId, 10));
      return sum + (item ? Number(item.sellingPrice || item.price || 0) * qty : 0);
    }, 0);
  };

  const handleSubmitTableOrder = async (e) => {
    e.preventDefault();
    const items = Object.entries(itemQuantities).map(([productId, quantity]) => ({
      productId: parseInt(productId, 10),
      quantity
    }));

    if (items.length === 0) {
      alert('Please select at least one dish for this order.');
      return;
    }

    setSubmittingOrder(true);
    try {
      await restaurantAPI.createOrder({
        tableNumber,
        customerName: customerName.trim() || undefined,
        notes: orderNotes.trim() || undefined,
        items
      });
      setOrderModalOpen(false);
      setItemQuantities({});
      fetchDashboardData();
      alert('Order successfully submitted to the kitchen.');
    } catch (error) {
      alert('Failed to submit order: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmittingOrder(false);
    }
  };

  // CASHIER Actions
  const handleOpenPayModal = (order) => {
    setSelectedOrderToPay(order);
    setPaymentMethod('CASH');
    setPayModalOpen(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedOrderToPay) return;
    setProcessingPayment(true);
    try {
      const response = await restaurantAPI.payOrder(selectedOrderToPay.id, { paymentMethod });
      setPaidReceipt(response.data);
      setPayModalOpen(false);
      fetchDashboardData();
    } catch (error) {
      alert('Failed to process payment: ' + (error.response?.data?.message || error.message));
    } finally {
      setProcessingPayment(false);
    }
  };

  // Issue Reporting
  const handleReportIssue = async (e) => {
    e.preventDefault();
    if (!issueForm.description.trim()) {
      alert('Please provide a description of the issue.');
      return;
    }

    setReportingIssue(true);
    try {
      await restaurantAPI.reportIssue(issueForm);
      setReportModalOpen(false);
      setIssueForm({ category: 'EQUIPMENT_MALFUNCTION', description: '' });
      alert('Issue reported to Branch Admin.');
      fetchDashboardData();
    } catch (error) {
      alert('Failed to report issue: ' + (error.response?.data?.message || error.message));
    } finally {
      setReportingIssue(false);
    }
  };

  if (loading) {
    return (
      <AppShell pageTitle="Operational Specialist Console">
        <div className="loading">Loading worker station data...</div>
      </AppShell>
    );
  }

  const worker = dashboardData?.worker;
  const isAttendanceMarked = Boolean(dashboardData?.todayAttendance);
  const designation = (worker?.designation || user?.designation || '').toUpperCase();
  const designationLabel = worker?.designationLabel || designation;

  return (
    <AppShell pageTitle={`${designationLabel || 'Field Specialist'} Console`}>
      <div className="worker-main">
        {/* Worker Header */}
        <div className="dashboard-header">
          <div>
            <h2>{user?.name || 'Operational Specialist'}</h2>
            <p className="subtitle">
              ID: <strong>{worker?.employeeId || 'N/A'}</strong> • Designation: <strong>{designationLabel}</strong> • Branch: <strong>{worker?.branch?.name || 'Assigned Facility'}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => setReportModalOpen(true)}
              className="btn btn-secondary"
            >
              Report Incident / Issue
            </button>
            <button
              onClick={handleMarkAttendance}
              disabled={markingAttendance || isAttendanceMarked}
              className={`btn ${isAttendanceMarked ? 'btn-secondary' : 'btn-primary'}`}
            >
              {markingAttendance ? 'Recording...' : isAttendanceMarked ? 'Checked In Today' : 'Mark Shift Attendance'}
            </button>
          </div>
        </div>

        {/* Operational Role Badge Banner */}
        <div className="worker-role-banner">
          <div>
            <span className="role-badge-tag">{designationLabel} Station</span>
            <span className="station-pill" style={{ marginLeft: '12px' }}>
              Facility Unit: <strong>{worker?.branch?.branchCode || 'N/A'}</strong>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
            <span>Shift: <strong>Standard Shift (06:00 - 15:00)</strong></span>
            <span>Status: <strong style={{ color: isAttendanceMarked ? 'var(--success)' : 'var(--warning)' }}>
              {isAttendanceMarked ? 'On Shift' : 'Check-In Required'}
            </strong></span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* DESIGNATION SPECIFIC OPERATIONAL CONSOLES                      */}
        {/* ------------------------------------------------------------- */}

        {/* 1. CHEF CONSOLE */}
        {designation === 'CHEF' && (
          <div className="section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3>Kitchen Station — Live Orders</h3>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Accept incoming orders, begin preparation, and signal ready to serve.
                </span>
              </div>
              <button onClick={fetchDashboardData} className="btn btn-secondary btn-sm">
                Refresh Orders
              </button>
            </div>

            {/* Sub-section: Incoming New Orders */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '10px' }}>
                New Orders Awaiting Acceptance ({dashboardData?.newOrders?.length || 0})
              </h4>
              {(!dashboardData?.newOrders || dashboardData.newOrders.length === 0) ? (
                <div className="empty-state">
                  <p>No new orders pending acceptance.</p>
                </div>
              ) : (
                <div className="order-grid">
                  {dashboardData.newOrders.map(order => (
                    <div key={order.id} className="order-ticket">
                      <div>
                        <div className="ticket-header">
                          <span className="ticket-table">{order.tableNumber}</span>
                          <span className="ticket-id">#{order.id}</span>
                        </div>
                        <div className="ticket-meta">
                          {order.customerName && <div>Customer: <strong>{order.customerName}</strong></div>}
                          <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
                            Created: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        {order.notes && (
                          <div className="ticket-notes">
                            Instructions: {order.notes}
                          </div>
                        )}

                        <div className="ticket-items-box">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="ticket-item-row">
                              <span className="ticket-item-name">{item.menuItemName}</span>
                              <span className="ticket-item-qty">{item.quantity}x</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="ticket-footer">
                        <span className="status-badge created">New Order</span>
                        <button
                          onClick={() => handleAcceptOrder(order.id)}
                          disabled={actionLoading === `accept-${order.id}`}
                          className="btn btn-primary btn-sm"
                        >
                          {actionLoading === `accept-${order.id}` ? 'Accepting...' : 'Accept Order'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sub-section: Accepted & In-Preparation Orders */}
            <div>
              <h4 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Cooking / Kitchen Line ({(dashboardData?.acceptedOrders?.length || 0) + (dashboardData?.preparingOrders?.length || 0)})
              </h4>
              {((!dashboardData?.acceptedOrders || dashboardData.acceptedOrders.length === 0) &&
                (!dashboardData?.preparingOrders || dashboardData.preparingOrders.length === 0)) ? (
                <div className="empty-state">
                  <p>Kitchen line clear. No active cooking orders.</p>
                </div>
              ) : (
                <div className="order-grid">
                  {/* Accepted orders */}
                  {dashboardData?.acceptedOrders?.map(order => (
                    <div key={order.id} className="order-ticket">
                      <div>
                        <div className="ticket-header">
                          <span className="ticket-table">{order.tableNumber}</span>
                          <span className="status-badge accepted">Accepted</span>
                        </div>
                        <div className="ticket-meta">
                          <div>Order #{order.id}</div>
                          {order.notes && <div className="ticket-notes">Instructions: {order.notes}</div>}
                        </div>
                        <div className="ticket-items-box">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="ticket-item-row">
                              <span className="ticket-item-name">{item.menuItemName}</span>
                              <span className="ticket-item-qty">{item.quantity}x</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="ticket-footer">
                        <span className="ticket-total">₹{Number(order.totalAmount || 0).toLocaleString()}</span>
                        <button
                          onClick={() => handleStartOrder(order.id)}
                          disabled={actionLoading === `start-${order.id}`}
                          className="btn btn-primary btn-sm"
                        >
                          {actionLoading === `start-${order.id}` ? 'Starting...' : 'Start Cooking'}
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Preparing orders */}
                  {dashboardData?.preparingOrders?.map(order => (
                    <div key={order.id} className="order-ticket" style={{ borderColor: 'var(--warning)' }}>
                      <div>
                        <div className="ticket-header">
                          <span className="ticket-table">{order.tableNumber}</span>
                          <span className="status-badge preparing">Cooking Now</span>
                        </div>
                        <div className="ticket-meta">
                          <div>Order #{order.id}</div>
                          {order.notes && <div className="ticket-notes">Instructions: {order.notes}</div>}
                        </div>
                        <div className="ticket-items-box">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="ticket-item-row">
                              <span className="ticket-item-name">{item.menuItemName}</span>
                              <span className="ticket-item-qty">{item.quantity}x</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="ticket-footer">
                        <span className="ticket-total">₹{Number(order.totalAmount || 0).toLocaleString()}</span>
                        <button
                          onClick={() => handleReadyOrder(order.id)}
                          disabled={actionLoading === `ready-${order.id}`}
                          className="btn btn-primary btn-sm"
                          style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}
                        >
                          {actionLoading === `ready-${order.id}` ? 'Updating...' : 'Mark Ready to Serve'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. WAITER CONSOLE */}
        {designation === 'WAITER' && (
          <div className="section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3>Dining Floor Station</h3>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Take new guest orders and deliver prepared dishes to tables.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleOpenOrderModal} className="btn btn-primary">
                  + Create Table Order
                </button>
                <button onClick={fetchDashboardData} className="btn btn-secondary">
                  Refresh
                </button>
              </div>
            </div>

            {/* Ready Orders for pickup */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Dishes Ready for Table Delivery ({dashboardData?.readyOrders?.length || 0})
              </h4>
              {(!dashboardData?.readyOrders || dashboardData.readyOrders.length === 0) ? (
                <div className="empty-state">
                  <p>No orders currently waiting for delivery to tables.</p>
                </div>
              ) : (
                <div className="order-grid">
                  {dashboardData.readyOrders.map(order => (
                    <div key={order.id} className="order-ticket" style={{ borderColor: 'var(--success)' }}>
                      <div>
                        <div className="ticket-header">
                          <span className="ticket-table">{order.tableNumber}</span>
                          <span className="status-badge ready">Ready in Kitchen</span>
                        </div>
                        <div className="ticket-meta">
                          <div>Order #{order.id} • Prepared by Chef {order.chef?.name || ''}</div>
                        </div>
                        <div className="ticket-items-box">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="ticket-item-row">
                              <span className="ticket-item-name">{item.menuItemName}</span>
                              <span className="ticket-item-qty">{item.quantity}x</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="ticket-footer">
                        <span className="ticket-total">₹{Number(order.totalAmount || 0).toLocaleString()}</span>
                        <button
                          onClick={() => handleServeOrder(order.id)}
                          disabled={actionLoading === `serve-${order.id}`}
                          className="btn btn-primary btn-sm"
                        >
                          {actionLoading === `serve-${order.id}` ? 'Serving...' : 'Serve to Table'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Served Tables */}
            <div>
              <h4 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Served & Active Dining Tables ({dashboardData?.servedOrders?.length || 0})
              </h4>
              {(!dashboardData?.servedOrders || dashboardData.servedOrders.length === 0) ? (
                <div className="empty-state">
                  <p>No active served tables awaiting billing.</p>
                </div>
              ) : (
                <div className="order-grid">
                  {dashboardData.servedOrders.map(order => (
                    <div key={order.id} className="order-ticket">
                      <div>
                        <div className="ticket-header">
                          <span className="ticket-table">{order.tableNumber}</span>
                          <span className="status-badge served">Served</span>
                        </div>
                        <div className="ticket-meta">
                          <div>Order #{order.id} • Awaiting Cashier Bill Settlement</div>
                        </div>
                        <div className="ticket-items-box">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="ticket-item-row">
                              <span className="ticket-item-name">{item.menuItemName}</span>
                              <span className="ticket-item-qty">{item.quantity}x</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="ticket-footer">
                        <span className="ticket-total">Bill: ₹{Number(order.totalAmount || 0).toLocaleString()}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dining Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. CASHIER CONSOLE */}
        {designation === 'CASHIER' && (
          <div className="section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3>Point of Sale & Billing Register</h3>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Collect payments from served tables. Payment automatically deducts raw inventory ingredients.
                </span>
              </div>
              <button onClick={fetchDashboardData} className="btn btn-secondary btn-sm">
                Refresh Register
              </button>
            </div>

            {/* Pending Bills */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Tables Awaiting Settlement ({dashboardData?.pendingBills?.length || 0})
              </h4>
              {(!dashboardData?.pendingBills || dashboardData.pendingBills.length === 0) ? (
                <div className="empty-state">
                  <p>All active tables are fully settled. No pending bills.</p>
                </div>
              ) : (
                <div className="order-grid">
                  {dashboardData.pendingBills.map(order => (
                    <div key={order.id} className="order-ticket">
                      <div>
                        <div className="ticket-header">
                          <span className="ticket-table">{order.tableNumber}</span>
                          <span className="status-badge served">Bill Pending</span>
                        </div>
                        <div className="ticket-meta">
                          <div>Order #{order.id} {order.customerName ? `• ${order.customerName}` : ''}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                            Served by {order.waiter?.name || 'Staff'}
                          </div>
                        </div>
                        <div className="ticket-items-box">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="ticket-item-row">
                              <span className="ticket-item-name">{item.menuItemName}</span>
                              <span className="ticket-item-price">
                                {item.quantity}x @ ₹{Number(item.unitPrice).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="ticket-footer">
                        <span className="ticket-total">₹{Number(order.totalAmount || 0).toLocaleString()}</span>
                        <button
                          onClick={() => handleOpenPayModal(order)}
                          className="btn btn-primary btn-sm"
                        >
                          Collect Payment
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Settled Orders Today */}
            <div>
              <h4 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Completed & Settled Invoices ({dashboardData?.completedOrders?.length || 0})
              </h4>
              {(!dashboardData?.completedOrders || dashboardData.completedOrders.length === 0) ? (
                <div className="empty-state">
                  <p>No settled orders recorded today yet.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Table</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Payment Mode</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.completedOrders.map(order => (
                        <tr key={order.id}>
                          <td><strong>#{order.id}</strong></td>
                          <td>{order.tableNumber}</td>
                          <td>{order.customerName || 'Walk-in'}</td>
                          <td>{order.items?.length || 0} items</td>
                          <td>
                            <span className="code-pill">
                              {order.bill?.paymentMethod || 'PAID'}
                            </span>
                          </td>
                          <td><strong>₹{Number(order.totalAmount || 0).toLocaleString()}</strong></td>
                          <td>
                            <span className="status-badge completed">Settled</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. INVENTORY WORKER CONSOLE */}
        {designation === 'INVENTORY_WORKER' && (
          <div className="section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3>Stock Telemetry & Ingredient Levels</h3>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Monitor raw restaurant ingredients and restock alert levels.
                </span>
              </div>
              <button onClick={() => navigate('/inventory')} className="btn btn-primary btn-sm">
                Open Full Inventory Register
              </button>
            </div>

            {dashboardData?.lowStockItems && dashboardData.lowStockItems.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Ingredient</th>
                      <th>Category</th>
                      <th>Current Quantity</th>
                      <th>Min Level</th>
                      <th>Unit</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.lowStockItems.map(item => (
                      <tr key={item.id}>
                        <td><strong>{item.itemName}</strong></td>
                        <td>{item.category || 'Kitchen Ingredient'}</td>
                        <td style={{ color: 'var(--danger)', fontWeight: 700 }}>
                          {item.quantity} {item.unit}
                        </td>
                        <td>{item.minimumStockLevel} {item.unit}</td>
                        <td>{item.unit}</td>
                        <td>
                          <span className="status-badge inactive">Low Stock</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>All ingredient levels are within healthy operational thresholds.</p>
              </div>
            )}
          </div>
        )}

        {/* 5. KITCHEN ASSISTANT, DELIVERY, CLEANING CONSOLES */}
        {['KITCHEN_ASSISTANT', 'DELIVERY_WORKER', 'CLEANING_WORKER'].includes(designation) && (
          <div className="section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3>{designationLabel} Task Station</h3>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Daily duty checklists and operational station duties.
                </span>
              </div>
              <button onClick={() => navigate('/tasks')} className="btn btn-primary btn-sm">
                View All Assigned Tasks
              </button>
            </div>

            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-content">
                  <h3>Assigned Tasks</h3>
                  <p className="kpi-value">{dashboardData?.assignedTasks || 0}</p>
                  <span className="kpi-meta-sub">Active duties</span>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-content">
                  <h3>Pending Tasks</h3>
                  <p className="kpi-value">{dashboardData?.pendingTasks || 0}</p>
                  <span className="kpi-meta-sub">To be completed</span>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-content">
                  <h3>Completed Tasks</h3>
                  <p className="kpi-value">{dashboardData?.completedTasks || 0}</p>
                  <span className="kpi-meta-sub">Resolved today</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Universal Facility Status & Tasks Summary */}
        <div className="section">
          <h3>Station & Shift Parameters</h3>
          <div className="status-card">
            <div className="status-item">
              <span className="status-label">Operational Unit:</span>
              <span className="status-value">{worker?.branch?.name || 'N/A'} ({worker?.branch?.branchCode || 'N/A'})</span>
            </div>
            <div className="status-item">
              <span className="status-label">Employee ID:</span>
              <span className="status-value">{worker?.employeeId || 'N/A'}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Shift Attendance:</span>
              <span className={`status-value ${isAttendanceMarked ? 'present' : 'absent'}`}>
                {isAttendanceMarked ? 'Checked In' : 'Pending Check-In'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Nav Links */}
        <div className="section">
          <h3>Operational Shortcuts</h3>
          <div className="action-grid">
            <button className="action-card" onClick={() => navigate('/tasks')}>
              <span>Task List</span>
            </button>
            <button className="action-card" onClick={() => navigate('/shifts')}>
              <span>Shift Schedule</span>
            </button>
            <button className="action-card" onClick={() => navigate('/inventory')}>
              <span>Stock Check</span>
            </button>
            <button className="action-card" onClick={() => setReportModalOpen(true)}>
              <span>Report Issue</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: REPORT INCIDENT / ISSUE                                */}
      {/* ------------------------------------------------------------- */}
      {reportModalOpen && (
        <div className="modal" onClick={() => setReportModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Report Facility Incident / Issue</h3>
              <button className="close-button" onClick={() => setReportModalOpen(false)}>
                x
              </button>
            </div>
            <form onSubmit={handleReportIssue}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Issue Category
                </label>
                <select
                  value={issueForm.category}
                  onChange={e => setIssueForm({ ...issueForm, category: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  <option value="EQUIPMENT_MALFUNCTION">Equipment Malfunction (Stove, Oven, POS)</option>
                  <option value="STOCK_SHORTAGE">Ingredient / Stock Shortage</option>
                  <option value="MAINTENANCE_REQUIRED">Facility Maintenance Required</option>
                  <option value="HEALTH_SAFETY">Health & Safety Concern</option>
                  <option value="OTHER">Other Operational Issue</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Issue Description
                </label>
                <textarea
                  rows={4}
                  value={issueForm.description}
                  onChange={e => setIssueForm({ ...issueForm, description: e.target.value })}
                  placeholder="Describe the issue clearly for the Branch Admin..."
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportingIssue}
                  className="btn btn-primary"
                >
                  {reportingIssue ? 'Submitting...' : 'Submit Incident Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CREATE TABLE ORDER (WAITER)                            */}
      {/* ------------------------------------------------------------- */}
      {orderModalOpen && (
        <div className="modal" onClick={() => setOrderModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Table Order</h3>
              <button className="close-button" onClick={() => setOrderModalOpen(false)}>
                x
              </button>
            </div>
            <form onSubmit={handleSubmitTableOrder}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Table Selection
                  </label>
                  <select
                    value={tableNumber}
                    onChange={e => setTableNumber(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    <option value="Table 1">Table 1</option>
                    <option value="Table 2">Table 2</option>
                    <option value="Table 3">Table 3</option>
                    <option value="Table 4">Table 4</option>
                    <option value="Table 5">Table 5</option>
                    <option value="Table 6">Table 6</option>
                    <option value="Table 7">Table 7</option>
                    <option value="Table 8">Table 8</option>
                    <option value="Takeaway">Takeaway Counter</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Customer Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Guest name"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Kitchen Special Instructions
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  placeholder="e.g. Less spicy, extra sauce, without onion"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Select Menu Items
                </label>
                <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px', background: 'var(--bg-secondary)' }}>
                  {menuItems.length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '8px 0' }}>No menu dishes loaded.</p>
                  ) : (
                    menuItems.map(item => {
                      const qty = itemQuantities[item.id] || 0;
                      const price = Number(item.sellingPrice || item.price || 0);
                      return (
                        <div
                          key={item.id}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              ₹{price.toLocaleString()} • {item.category || 'Menu Item'}
                            </div>
                          </div>
                          <div className="qty-control">
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => handleQuantityChange(item.id, -1)}
                            >
                              -
                            </button>
                            <span className="qty-val">{qty}</span>
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => handleQuantityChange(item.id, 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Order summary calculation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Total Items: <strong>{Object.values(itemQuantities).reduce((a, b) => a + b, 0)}</strong>
                </span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Estimated Total: ₹{calculateOrderSubtotal().toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setOrderModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="btn btn-primary"
                >
                  {submittingOrder ? 'Submitting...' : 'Dispatch to Kitchen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: COLLECT PAYMENT (CASHIER)                               */}
      {/* ------------------------------------------------------------- */}
      {payModalOpen && selectedOrderToPay && (
        <div className="modal" onClick={() => setPayModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Collect Bill Payment</h3>
              <button className="close-button" onClick={() => setPayModalOpen(false)}>
                x
              </button>
            </div>
            <div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Table: <strong>{selectedOrderToPay.tableNumber}</strong> • Order <strong>#{selectedOrderToPay.id}</strong>
                </div>
                {selectedOrderToPay.customerName && (
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Customer: <strong>{selectedOrderToPay.customerName}</strong>
                  </div>
                )}
              </div>

              <div className="ticket-items-box" style={{ marginBottom: '16px' }}>
                {selectedOrderToPay.items?.map((item, idx) => (
                  <div key={idx} className="ticket-item-row">
                    <span>{item.menuItemName} (x{item.quantity})</span>
                    <span>₹{Number(item.totalPrice).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Payment Method
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {['CASH', 'UPI', 'CARD'].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`btn ${paymentMethod === method ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ textAlign: 'center', padding: '10px 0' }}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>Bill Amount Due:</span>
                  <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-blue)' }}>
                    ₹{Number(selectedOrderToPay.totalAmount || 0).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Confirming payment will automatically deduct raw ingredient inventory.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProcessPayment}
                  disabled={processingPayment}
                  className="btn btn-primary"
                >
                  {processingPayment ? 'Processing...' : `Confirm Payment (₹${Number(selectedOrderToPay.totalAmount || 0).toLocaleString()})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: RECEIPT CONFIRMATION (CASHIER)                         */}
      {/* ------------------------------------------------------------- */}
      {paidReceipt && (
        <div className="modal" onClick={() => setPaidReceipt(null)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Settlement Receipt</h3>
              <button className="close-button" onClick={() => setPaidReceipt(null)}>
                x
              </button>
            </div>
            <div className="receipt-box">
              <div className="receipt-title">
                {worker?.branch?.name || 'AtoZ Restaurant'}
              </div>
              <div className="receipt-sub">
                Official Bill of Supply • Code: {worker?.branch?.branchCode || 'A2Z-ERD-001'}
              </div>
              <div className="receipt-row">
                <span>Receipt Number:</span>
                <strong>{paidReceipt.bill?.billNumber || `REC-${paidReceipt.id}`}</strong>
              </div>
              <div className="receipt-row">
                <span>Table:</span>
                <strong>{paidReceipt.tableNumber}</strong>
              </div>
              <div className="receipt-row">
                <span>Settled At:</span>
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="receipt-row">
                <span>Payment Mode:</span>
                <strong>{paidReceipt.bill?.paymentMethod || paymentMethod}</strong>
              </div>

              <div className="receipt-divider" />

              {paidReceipt.items?.map((item, idx) => (
                <div key={idx} className="receipt-row">
                  <span>{item.menuItemName} x{item.quantity}</span>
                  <span>₹{Number(item.totalPrice).toLocaleString()}</span>
                </div>
              ))}

              <div className="receipt-divider" />

              <div className="receipt-total-row">
                <span>Total Settled:</span>
                <span>₹{Number(paidReceipt.totalAmount || 0).toLocaleString()}</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginTop: '14px' }}>
                Inventory ingredients deducted successfully. Thank you!
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-secondary"
              >
                Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setPaidReceipt(null)}
                className="btn btn-primary"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default WorkerDashboard;
