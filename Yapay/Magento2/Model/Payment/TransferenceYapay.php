<?php

namespace Yapay\Magento2\Model\Payment;


use Yapay\Magento2\Helper\Data;
use Magento\Checkout\Model\Cart;
use Magento\Checkout\Model\Session;

class TransferenceYapay extends PaymentAbstract
{
    /**
     * Constante que indica qual tipo de pagamento corresponde a classe
     */
    const CODE = 'yapay_transference';

    /**
     * @var string
     */
    protected $_code = self::CODE;
    
}