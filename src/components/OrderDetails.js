import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { cancelOrder } from '../services/api';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoadedStates, setImageLoadedStates] = useState({}); // Track image loading state per item ID

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        console.log('Order Details API Response:', response.data);
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details.');
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  const handleCancelOrder = async () => {
    if (!order || !['processing', 'packing'].includes(order.shipmentStatus?.toLowerCase())) {
      toast.error('Order cannot be cancelled at this stage.');
      return;
    }

    try {
      const response = await cancelOrder(id);
      console.log('Cancel Order Response:', response);
      toast.success('Order cancelled successfully!');
      setOrder((prevOrder) => ({
        ...prevOrder,
        status: 'Cancelled',
        shipmentStatus: 'Cancelled',
      }));
    } catch (error) {
      console.error('Failed to cancel order:', error.message);
      toast.error(error.message || 'Failed to cancel order. Please try again.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!order) return <div>Order not found.</div>;

  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  // Debug the shipmentStatus value
  console.log('Shipment Status:', order.shipmentStatus);
  console.log('Can Cancel:', ['processing', 'packing'].includes(order.shipmentStatus?.toLowerCase()));

  return (
    <div className="container my-5">
      <h2>Order #{order.id}</h2>
      <p>Date: {new Date(order.orderDate).toLocaleDateString()}</p>
      <p>Total: ${order.total.toFixed(2)}</p>
      <p>Status: {order.status}</p>
      <p>Shipment Status: {order.shipmentStatus || 'Not yet shipped'}</p>
      <h4>Items:</h4>
      <ul className="list-group">
        {order.items.map((item) => {
          console.log('Order Item:', item);
          const imageUrl = item.product?.imageUrl
            ? `${baseUrl}/uploads/${item.product.imageUrl}`
            : '/placeholder.jpg';
          console.log('Image URL:', imageUrl);

          // Use the item ID as the key for the image loading state
          const isImageLoaded = imageLoadedStates[item.id] || false;
          const handleImageLoad = () => {
            setImageLoadedStates((prev) => ({ ...prev, [item.id]: true }));
          };
          const handleImageError = (e) => {
            e.target.src = '/placeholder.jpg';
            setImageLoadedStates((prev) => ({ ...prev, [item.id]: true }));
          };

          return (
            <li key={item.id} className="list-group-item d-flex align-items-center">
              {!isImageLoaded && (
                <img
                  src="/placeholder.jpg"
                  className="img-thumbnail me-3"
                  alt={item.product.name}
                  style={{ width: '100px', height: '100px', objectFit: 'cover', opacity: 0.5 }}
                />
              )}
              <img
                src={imageUrl}
                className="img-thumbnail me-3"
                alt={item.product.name}
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ width: '100px', height: '100px', objectFit: 'cover', display: isImageLoaded ? 'block' : 'none' }}
              />
              <div>
                {item.product.name} - {item.quantity} x ${item.price.toFixed(2)}
              </div>
            </li>
          );
        })}
      </ul>
      <h4>Shipping Address:</h4>
      <p>{order.shippingAddress.fullName}</p>
      <p>{order.shippingAddress.streetAddress}</p>
      <p>
        {order.shippingAddress.city}, {order.shippingAddress.postalCode}
      </p>
      {['processing', 'packing'].includes(order.shipmentStatus?.toLowerCase()) && (
        <button
          className="btn btn-sm btn-outline-danger mt-3"
          onClick={handleCancelOrder}
        >
          Cancel Order
        </button>
      )}
    </div>
  );
};

export default OrderDetails;