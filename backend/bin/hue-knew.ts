#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { HueKnewStack } from '../lib/hue-knew-stack';

const app = new cdk.App();
new HueKnewStack(app, 'HueKnewStack');
