<?php
/* Fichero auxiliar para calcular hashes dado un texto plano */

echo password_hash($argv[1], PASSWORD_DEFAULT);