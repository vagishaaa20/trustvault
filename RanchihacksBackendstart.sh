#!/bin/bash

cd backend && npm start &
sleep 3

cd ../frontend && npm start

